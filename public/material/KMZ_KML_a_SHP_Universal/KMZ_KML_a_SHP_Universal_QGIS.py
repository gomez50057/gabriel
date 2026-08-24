# -*- coding: utf-8 -*-
"""
Conversor UNIVERSAL KML/KMZ -> SHP + QML + GeoPackage para QGIS 3.x
---------
Diseñado para evitar dos problemas frecuentes:
1) perder partes de MultiGeometry/Polygon;
2) que el SHP no se genere por usar ancho 254 en todos los campos DBF.

Características:
- Una entidad de salida por Placemark y por tipo geométrico.
- Un Placemark con varios Polygon se conserva como MultiPolygon (una fila, varias partes).
- Lee KML y KMZ, incluso con varios .kml internos.
- Repara xmlns:xsi ausente en KML malformados comunes.
- Extrae atributos de tablas HTML de <description>.
- Extrae ExtendedData/Data y SchemaData/SimpleData.
- Soporta Style, StyleMap e inline Style.
- Conserva PolyStyle/LineStyle/IconStyle como campos RGBA.
- Aplica los colores en QGIS y guarda un .qml junto al SHP.
- Calcula el ancho REAL de los campos de texto del SHP, en vez de 254 para todos.
- Si un texto supera 254 caracteres, lo divide en varios campos SHP para no perderlo.
- Crea un GeoPackage maestro con campos completos.
- Valida recuentos antes y después de escribir.

Ejecución:
QGIS -> Complementos -> Consola de Python -> Mostrar editor -> abrir este .py -> Ejecutar.
"""

import os
import re
import html
import zipfile
import posixpath
import xml.etree.ElementTree as ET
from collections import OrderedDict

from qgis.PyQt.QtCore import QVariant
from qgis.PyQt.QtWidgets import QFileDialog, QMessageBox

from qgis.core import (
    QgsProject,
    QgsVectorLayer,
    QgsVectorFileWriter,
    QgsField,
    QgsFeature,
    QgsGeometry,
    QgsPointXY,
    QgsFillSymbol,
    QgsLineSymbol,
    QgsMarkerSymbol,
    QgsSingleSymbolRenderer,
    QgsSymbolLayer,
    QgsProperty,
)

KML_CRS = "EPSG:4326"
SHP_TEXT_MAX = 254


# -----------------------------------------------------------------------------
# XML / HTML
# -----------------------------------------------------------------------------

def lname(tag):
    if not isinstance(tag, str):
        return ""
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def first_child(element, name):
    for c in element:
        if lname(c.tag) == name:
            return c
    return None


def child_text(element, name, default=""):
    c = first_child(element, name)
    if c is None or c.text is None:
        return default
    return c.text.strip()


def clean_html_text(value):
    if value is None:
        return ""
    value = re.sub(r"<br\s*/?>", " ", str(value), flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = value.replace("\xa0", " ")
    return re.sub(r"\s+", " ", value).strip()


ROW_RE = re.compile(r"<tr\b[^>]*>(.*?)</tr>", re.I | re.S)
TD_RE = re.compile(r"<td\b[^>]*>(.*?)</td>", re.I | re.S)


def parse_html_description(text):
    result = OrderedDict()
    if not text:
        return result

    for row_html in ROW_RE.findall(str(text)):
        cells = TD_RE.findall(row_html)
        if len(cells) < 2:
            continue
        key = clean_html_text(cells[0])
        value = clean_html_text(cells[1])
        if key:
            result[key] = value
    return result


def parse_extended_data(placemark):
    result = OrderedDict()
    for e in placemark.iter():
        n = lname(e.tag)
        if n == "Data":
            key = e.attrib.get("name", "").strip()
            if not key:
                continue
            value = ""
            for c in e:
                if lname(c.tag) == "value":
                    value = (c.text or "").strip()
                    break
            result[key] = value
        elif n == "SimpleData":
            key = e.attrib.get("name", "").strip()
            if key:
                result[key] = (e.text or "").strip()
    return result


def repair_and_parse_xml(raw_bytes, label="KML"):
    text = raw_bytes.decode("utf-8-sig", errors="replace")

    # KML de algunos exportadores usa xsi:schemaLocation sin xmlns:xsi.
    if "xsi:" in text and "xmlns:xsi=" not in text:
        text = re.sub(
            r"<kml\b",
            '<kml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
            text,
            count=1,
        )

    try:
        return ET.fromstring(text)
    except ET.ParseError:
        # Respaldo: quitar atributos xsi:* problemáticos.
        text2 = re.sub(
            r"\s+xsi:[A-Za-z_][\w.\-]*\s*=\s*(?:\"[^\"]*\"|'[^']*')",
            "",
            text,
            flags=re.S,
        )
        try:
            return ET.fromstring(text2)
        except ET.ParseError as e:
            raise Exception("No se pudo interpretar {}: {}".format(label, e))


def load_kml_documents(input_path):
    docs = OrderedDict()
    if input_path.lower().endswith(".kmz"):
        with zipfile.ZipFile(input_path, "r") as z:
            names = [n for n in z.namelist() if n.lower().endswith(".kml")]
            if not names:
                raise Exception("El KMZ no contiene archivos .kml.")
            names.sort(
                key=lambda n: (
                    0 if posixpath.basename(n).lower() == "doc.kml" else 1,
                    n.lower(),
                )
            )
            for name in names:
                docs[name] = repair_and_parse_xml(z.read(name), name)
    else:
        with open(input_path, "rb") as f:
            docs[posixpath.basename(input_path)] = repair_and_parse_xml(
                f.read(), input_path
            )
    return docs


# -----------------------------------------------------------------------------
# ESTILOS
# -----------------------------------------------------------------------------

def kml_color_to_rgba(value, default):
    # KML: AABBGGRR -> QGIS: R,G,B,A
    if not value:
        return default
    value = value.strip().replace("#", "")
    if len(value) != 8 or not re.fullmatch(r"[0-9A-Fa-f]{8}", value):
        return default
    a = int(value[0:2], 16)
    b = int(value[2:4], 16)
    g = int(value[4:6], 16)
    r = int(value[6:8], 16)
    return (r, g, b, a)


def default_style():
    return {
        "fill": (255, 255, 255, 255),
        "line": (0, 0, 0, 255),
        "line_width": 1.0,
        "icon": (255, 255, 255, 255),
        "icon_scale": 1.0,
        "icon_href": "",
    }


def read_style(style_element):
    style = default_style()
    for c in style_element:
        n = lname(c.tag)
        if n == "PolyStyle":
            color = child_text(c, "color")
            if color:
                style["fill"] = kml_color_to_rgba(color, style["fill"])
            if child_text(c, "fill") == "0":
                r, g, b, _ = style["fill"]
                style["fill"] = (r, g, b, 0)
            if child_text(c, "outline") == "0":
                r, g, b, _ = style["line"]
                style["line"] = (r, g, b, 0)

        elif n == "LineStyle":
            color = child_text(c, "color")
            if color:
                style["line"] = kml_color_to_rgba(color, style["line"])
            width = child_text(c, "width")
            if width:
                try:
                    style["line_width"] = float(width)
                except Exception:
                    pass

        elif n == "IconStyle":
            color = child_text(c, "color")
            if color:
                style["icon"] = kml_color_to_rgba(color, style["icon"])
            scale = child_text(c, "scale")
            if scale:
                try:
                    style["icon_scale"] = float(scale)
                except Exception:
                    pass
            icon = first_child(c, "Icon")
            if icon is not None:
                style["icon_href"] = child_text(icon, "href")
    return style


def normalize_style_ref(current_doc, style_url):
    if not style_url:
        return (current_doc, "")
    if "#" in style_url:
        doc_part, style_id = style_url.rsplit("#", 1)
    else:
        doc_part, style_id = "", style_url
    if not doc_part:
        return (current_doc, style_id)
    if re.match(r"^[a-zA-Z][a-zA-Z0-9+.\-]*://", doc_part):
        return (doc_part, style_id)
    base_dir = posixpath.dirname(current_doc)
    return (posixpath.normpath(posixpath.join(base_dir, doc_part)), style_id)


def collect_styles(docs):
    styles = {}
    stylemaps = {}
    global_styles = {}
    global_maps = {}

    for doc_name, root in docs.items():
        for e in root.iter():
            n = lname(e.tag)
            sid = e.attrib.get("id", "").strip()
            if n == "Style" and sid:
                parsed = read_style(e)
                styles[(doc_name, sid)] = parsed
                global_styles.setdefault(sid, parsed)

            elif n == "StyleMap" and sid:
                normal = None
                for pair in e:
                    if lname(pair.tag) != "Pair":
                        continue
                    if child_text(pair, "key") != "normal":
                        continue
                    inline = first_child(pair, "Style")
                    if inline is not None:
                        normal = ("inline", read_style(inline))
                        break
                    url = child_text(pair, "styleUrl")
                    if url:
                        normal = ("ref", normalize_style_ref(doc_name, url))
                        break
                if normal:
                    stylemaps[(doc_name, sid)] = normal
                    global_maps.setdefault(sid, normal)

    return styles, stylemaps, global_styles, global_maps


def resolve_style(pm, doc_name, styles, stylemaps, global_styles, global_maps):
    inline = first_child(pm, "Style")
    if inline is not None:
        return read_style(inline), "INLINE"

    style_url = child_text(pm, "styleUrl")
    if not style_url:
        return default_style(), ""

    ref = normalize_style_ref(doc_name, style_url)
    original_id = ref[1]
    visited = set()

    while ref not in visited:
        visited.add(ref)
        if ref in styles:
            return dict(styles[ref]), original_id
        if ref in stylemaps:
            kind, value = stylemaps[ref]
            if kind == "inline":
                return dict(value), original_id
            ref = value
            continue

        sid = ref[1]
        if sid in global_styles:
            return dict(global_styles[sid]), original_id
        if sid in global_maps:
            kind, value = global_maps[sid]
            if kind == "inline":
                return dict(value), original_id
            ref = value
            continue
        break

    return default_style(), original_id


# -----------------------------------------------------------------------------
# GEOMETRÍAS
# -----------------------------------------------------------------------------

def parse_coordinates(text):
    points = []
    if not text:
        return points
    for chunk in re.split(r"\s+", text.strip()):
        if not chunk:
            continue
        parts = chunk.split(",")
        if len(parts) < 2:
            continue
        try:
            points.append(QgsPointXY(float(parts[0]), float(parts[1])))
        except Exception:
            pass
    return points


def close_ring(points):
    if len(points) >= 3 and points[0] != points[-1]:
        points.append(QgsPointXY(points[0].x(), points[0].y()))
    return points


def find_descendant(element, name):
    for e in element.iter():
        if lname(e.tag) == name:
            return e
    return None


def read_polygon(poly_element):
    rings = []
    outer = first_child(poly_element, "outerBoundaryIs")
    if outer is None:
        return None
    ring_element = find_descendant(outer, "LinearRing")
    if ring_element is None:
        return None
    coord_element = find_descendant(ring_element, "coordinates")
    if coord_element is None:
        return None

    exterior = close_ring(parse_coordinates(coord_element.text))
    if len(exterior) < 4:
        return None
    rings.append(exterior)

    for inner in poly_element:
        if lname(inner.tag) != "innerBoundaryIs":
            continue
        inner_ring = find_descendant(inner, "LinearRing")
        if inner_ring is None:
            continue
        inner_coord = find_descendant(inner_ring, "coordinates")
        if inner_coord is None:
            continue
        pts = close_ring(parse_coordinates(inner_coord.text))
        if len(pts) >= 4:
            rings.append(pts)
    return rings


def geometry_parts_from_placemark(pm):
    polygons, lines, points = [], [], []

    # IMPORTANTE: se recorre TODO el Placemark. Así MultiGeometry no se pierde.
    for e in pm.iter():
        n = lname(e.tag)
        if n == "Polygon":
            poly = read_polygon(e)
            if poly:
                polygons.append(poly)

        elif n == "LineString":
            coord = find_descendant(e, "coordinates")
            if coord is not None:
                pts = parse_coordinates(coord.text)
                if len(pts) >= 2:
                    lines.append(pts)

        elif n == "Point":
            coord = find_descendant(e, "coordinates")
            if coord is not None:
                pts = parse_coordinates(coord.text)
                if pts:
                    points.append(pts[0])

        elif n == "Track":  # gx:Track
            track_pts = []
            for c in e:
                if lname(c.tag) == "coord" and c.text:
                    p = c.text.strip().split()
                    if len(p) >= 2:
                        try:
                            track_pts.append(QgsPointXY(float(p[0]), float(p[1])))
                        except Exception:
                            pass
            if len(track_pts) >= 2:
                lines.append(track_pts)

    return {"polygon": polygons, "line": lines, "point": points}


def make_geometry(kind, parts):
    if kind == "polygon":
        return QgsGeometry.fromMultiPolygonXY(parts)
    if kind == "line":
        return QgsGeometry.fromMultiPolylineXY(parts)
    if kind == "point":
        return QgsGeometry.fromMultiPointXY(parts)
    return QgsGeometry()


# -----------------------------------------------------------------------------
# REGISTROS
# -----------------------------------------------------------------------------

def collect_records(docs):
    styles, stylemaps, global_styles, global_maps = collect_styles(docs)

    records = {"polygon": [], "line": [], "point": []}
    attr_order = []
    attr_seen = set()
    placemark_count = 0
    part_counts = {"polygon": 0, "line": 0, "point": 0}
    empty_placemarks = []

    for doc_name, root in docs.items():
        for pm in root.iter():
            if lname(pm.tag) != "Placemark":
                continue

            placemark_count += 1
            pm_no = placemark_count

            attrs = parse_extended_data(pm)
            html_attrs = parse_html_description(child_text(pm, "description"))
            for k, v in html_attrs.items():
                attrs.setdefault(k, v)

            for k in attrs:
                if k not in attr_seen:
                    attr_seen.add(k)
                    attr_order.append(k)

            style, style_id = resolve_style(
                pm, doc_name, styles, stylemaps, global_styles, global_maps
            )
            geom_parts = geometry_parts_from_placemark(pm)

            base = {
                "PM_NO": pm_no,
                "KML_ID": pm.attrib.get("id", ""),
                "KML_NAME": child_text(pm, "name"),
                "STYLE_ID": style_id,
                "attributes": attrs,
                "style": style,
                "doc_name": doc_name,
            }

            has_geom = False
            for kind in ("polygon", "line", "point"):
                parts = geom_parts[kind]
                if not parts:
                    continue
                has_geom = True
                part_counts[kind] += len(parts)
                rec = dict(base)
                rec["geometry"] = make_geometry(kind, parts)
                rec["part_count"] = len(parts)
                records[kind].append(rec)

            if not has_geom:
                empty_placemarks.append(pm_no)

    return {
        "records": records,
        "attr_order": attr_order,
        "placemark_count": placemark_count,
        "part_counts": part_counts,
        "style_count": len(styles),
        "stylemap_count": len(stylemaps),
        "empty_placemarks": empty_placemarks,
    }


# -----------------------------------------------------------------------------
# CAMPOS / SHP
# -----------------------------------------------------------------------------

def infer_type(records_all, attr_name):
    vals = []
    for rec in records_all:
        v = rec["attributes"].get(attr_name, "")
        if v is None:
            continue
        s = str(v).strip()
        if s:
            vals.append(s)
    if not vals:
        return "string"

    if all(re.fullmatch(r"-?\d+", v) for v in vals):
        # códigos con cero inicial se quedan como texto
        if not any(re.fullmatch(r"-?0\d+", v) for v in vals):
            return "int"

    try:
        for v in vals:
            float(v)
        return "double"
    except Exception:
        return "string"


def actual_text_width(records, attr_name, source="attributes"):
    m = 1
    for rec in records:
        if source == "attributes":
            value = rec["attributes"].get(attr_name, "")
        else:
            value = rec.get(attr_name, "")
        if value is not None:
            m = max(m, len(str(value)))
    return max(1, min(SHP_TEXT_MAX, m))


def safe_shp_name(name, used):
    cleaned = re.sub(r"[^A-Za-z0-9_]", "_", str(name)) or "CAMPO"
    cleaned = cleaned[:10]
    candidate = cleaned
    i = 1
    while candidate.lower() in used:
        suffix = str(i)
        candidate = cleaned[: 10 - len(suffix)] + suffix
        i += 1
    used.add(candidate.lower())
    return candidate


STYLE_FIELDS = [
    ("FILL_R", QVariant.Int), ("FILL_G", QVariant.Int),
    ("FILL_B", QVariant.Int), ("FILL_A", QVariant.Int),
    ("LINE_R", QVariant.Int), ("LINE_G", QVariant.Int),
    ("LINE_B", QVariant.Int), ("LINE_A", QVariant.Int),
    ("LINE_W", QVariant.Double),
    ("ICON_R", QVariant.Int), ("ICON_G", QVariant.Int),
    ("ICON_B", QVariant.Int), ("ICON_A", QVariant.Int),
    ("ICON_SCL", QVariant.Double),
]


def make_shp_chunks(attr_order, attr_types, records_all):
    """
    Define cómo se representa cada atributo en SHP.
    Si un string >254, crea partes FIELD_1, FIELD_2... para no perder contenido.
    """
    plan = OrderedDict()
    for name in attr_order:
        t = attr_types[name]
        if t != "string":
            plan[name] = [(name, t, None)]
            continue

        max_len = 0
        for rec in records_all:
            v = rec["attributes"].get(name, "")
            max_len = max(max_len, len(str(v)) if v is not None else 0)

        if max_len <= SHP_TEXT_MAX:
            plan[name] = [(name, "string", max(1, max_len))]
        else:
            parts = []
            n = (max_len + SHP_TEXT_MAX - 1) // SHP_TEXT_MAX
            for i in range(n):
                parts.append(("{}_{}".format(name, i + 1), "string", SHP_TEXT_MAX))
            plan[name] = parts
    return plan


def field_plan(attr_order, attr_types, records, for_shp, shp_chunks=None):
    used = set()
    mapping = OrderedDict()
    fields = []

    base_defs = [
        ("PM_NO", QVariant.Int, None),
        ("KML_ID", QVariant.String, actual_text_width(records, "KML_ID", "base")),
        ("KML_NAME", QVariant.String, actual_text_width(records, "KML_NAME", "base")),
        ("STYLE_ID", QVariant.String, actual_text_width(records, "STYLE_ID", "base")),
        ("PARTS", QVariant.Int, None),
    ]

    for name, qtype, width in base_defs:
        out_name = safe_shp_name(name, used) if for_shp else name
        mapping[name] = out_name
        if qtype == QVariant.String:
            fields.append(QgsField(out_name, qtype, "string", width or 1))
        else:
            fields.append(QgsField(out_name, qtype))

    if for_shp:
        # mapping[attr] = lista de (shp_field, start, end)
        mapping["__SHP_ATTR_CHUNKS__"] = OrderedDict()
        for original in attr_order:
            chunks = shp_chunks[original]
            chunk_map = []
            for idx, (logical_name, t, width) in enumerate(chunks):
                out_name = safe_shp_name(logical_name, used)
                if t == "int":
                    fields.append(QgsField(out_name, QVariant.Int))
                    chunk_map.append((out_name, None, None, "int"))
                elif t == "double":
                    fields.append(QgsField(out_name, QVariant.Double, "double", 20, 8))
                    chunk_map.append((out_name, None, None, "double"))
                else:
                    fields.append(QgsField(out_name, QVariant.String, "string", width or 1))
                    start = idx * SHP_TEXT_MAX
                    end = start + SHP_TEXT_MAX
                    chunk_map.append((out_name, start, end, "string"))
            mapping["__SHP_ATTR_CHUNKS__"][original] = chunk_map
    else:
        for name in attr_order:
            out_name = name
            # evitar colisiones exactas
            candidate = out_name
            i = 1
            while candidate.lower() in used:
                candidate = "{}_{}".format(out_name, i)
                i += 1
            out_name = candidate
            used.add(out_name.lower())
            mapping[name] = out_name

            t = attr_types[name]
            if t == "int":
                fields.append(QgsField(out_name, QVariant.Int))
            elif t == "double":
                fields.append(QgsField(out_name, QVariant.Double, "double", 20, 8))
            else:
                fields.append(QgsField(out_name, QVariant.String))

    for name, qtype in STYLE_FIELDS:
        out_name = safe_shp_name(name, used) if for_shp else name
        mapping[name] = out_name
        if qtype == QVariant.Double:
            fields.append(QgsField(out_name, qtype, "double", 12, 4))
        else:
            fields.append(QgsField(out_name, qtype))

    return fields, mapping


def coerce(value, t):
    if value is None or str(value).strip() == "":
        return None
    if t == "int":
        try:
            return int(str(value).strip())
        except Exception:
            return None
    if t == "double":
        try:
            return float(str(value).strip())
        except Exception:
            return None
    return str(value)


# -----------------------------------------------------------------------------
# SIMBOLOGÍA
# -----------------------------------------------------------------------------

def color_expr(mapping, prefix):
    return 'color_rgba("{r}","{g}","{b}","{a}")'.format(
        r=mapping[prefix + "_R"],
        g=mapping[prefix + "_G"],
        b=mapping[prefix + "_B"],
        a=mapping[prefix + "_A"],
    )


def apply_renderer(layer, kind, mapping):
    if kind == "polygon":
        symbol = QgsFillSymbol.createSimple({
            "color": "255,255,255,255",
            "outline_color": "0,0,0,255",
            "outline_width": "0.25",
        })
        sl = symbol.symbolLayer(0)
        sl.setDataDefinedProperty(
            QgsSymbolLayer.PropertyFillColor,
            QgsProperty.fromExpression(color_expr(mapping, "FILL")),
        )
        sl.setDataDefinedProperty(
            QgsSymbolLayer.PropertyStrokeColor,
            QgsProperty.fromExpression(color_expr(mapping, "LINE")),
        )
        sl.setDataDefinedProperty(
            QgsSymbolLayer.PropertyStrokeWidth,
            QgsProperty.fromExpression('"{}" * 0.264583'.format(mapping["LINE_W"])),
        )

    elif kind == "line":
        symbol = QgsLineSymbol.createSimple({"color": "0,0,0,255", "width": "0.25"})
        sl = symbol.symbolLayer(0)
        sl.setDataDefinedProperty(
            QgsSymbolLayer.PropertyStrokeColor,
            QgsProperty.fromExpression(color_expr(mapping, "LINE")),
        )
        sl.setDataDefinedProperty(
            QgsSymbolLayer.PropertyStrokeWidth,
            QgsProperty.fromExpression('"{}" * 0.264583'.format(mapping["LINE_W"])),
        )

    else:
        symbol = QgsMarkerSymbol.createSimple({"name": "circle", "color": "255,255,255,255", "size": "2.5"})
        sl = symbol.symbolLayer(0)
        sl.setDataDefinedProperty(
            QgsSymbolLayer.PropertyFillColor,
            QgsProperty.fromExpression(color_expr(mapping, "ICON")),
        )

    layer.setRenderer(QgsSingleSymbolRenderer(symbol))
    layer.triggerRepaint()


# -----------------------------------------------------------------------------
# CAPA TEMPORAL
# -----------------------------------------------------------------------------

MEMORY_URI = {
    "polygon": "MultiPolygon?crs={}".format(KML_CRS),
    "line": "MultiLineString?crs={}".format(KML_CRS),
    "point": "MultiPoint?crs={}".format(KML_CRS),
}


def build_layer(records, kind, layer_name, attr_order, attr_types, for_shp=False, shp_chunks=None):
    layer = QgsVectorLayer(MEMORY_URI[kind], layer_name, "memory")
    if not layer.isValid():
        raise Exception("No se pudo crear la capa temporal {}".format(layer_name))

    provider = layer.dataProvider()
    fields, mapping = field_plan(
        attr_order, attr_types, records, for_shp, shp_chunks=shp_chunks
    )
    if not provider.addAttributes(fields):
        raise Exception("No se pudieron crear campos en {}".format(layer_name))
    layer.updateFields()

    out = []
    for rec in records:
        f = QgsFeature(layer.fields())
        f.setGeometry(QgsGeometry(rec["geometry"]))
        f[mapping["PM_NO"]] = rec["PM_NO"]
        f[mapping["KML_ID"]] = rec["KML_ID"]
        f[mapping["KML_NAME"]] = rec["KML_NAME"]
        f[mapping["STYLE_ID"]] = rec["STYLE_ID"]
        f[mapping["PARTS"]] = rec["part_count"]

        if for_shp:
            for original in attr_order:
                raw = rec["attributes"].get(original)
                for out_name, start, end, t in mapping["__SHP_ATTR_CHUNKS__"][original]:
                    if t == "string":
                        s = "" if raw is None else str(raw)
                        f[out_name] = s[start:end] if s else None
                    else:
                        f[out_name] = coerce(raw, t)
        else:
            for name in attr_order:
                f[mapping[name]] = coerce(rec["attributes"].get(name), attr_types[name])

        style = rec["style"]
        fr, fg, fb, fa = style["fill"]
        lr, lg, lb, la = style["line"]
        ir, ig, ib, ia = style["icon"]
        values = {
            "FILL_R": fr, "FILL_G": fg, "FILL_B": fb, "FILL_A": fa,
            "LINE_R": lr, "LINE_G": lg, "LINE_B": lb, "LINE_A": la,
            "LINE_W": style["line_width"],
            "ICON_R": ir, "ICON_G": ig, "ICON_B": ib, "ICON_A": ia,
            "ICON_SCL": style["icon_scale"],
        }
        for k, v in values.items():
            f[mapping[k]] = v
        out.append(f)

    result = provider.addFeatures(out)
    ok = result[0] if isinstance(result, tuple) else bool(result)
    layer.updateExtents()
    if not ok or layer.featureCount() != len(records):
        raise Exception(
            "Error insertando {}. Esperadas {} / Insertadas {}".format(
                layer_name, len(records), layer.featureCount()
            )
        )

    apply_renderer(layer, kind, mapping)
    return layer, mapping


# -----------------------------------------------------------------------------
# ESCRITURA
# -----------------------------------------------------------------------------

def write_vector(layer, path, driver, layer_name=None, overwrite_layer=False):
    opts = QgsVectorFileWriter.SaveVectorOptions()
    opts.driverName = driver
    opts.fileEncoding = "UTF-8"
    if layer_name:
        opts.layerName = layer_name
    if driver == "GPKG" and overwrite_layer:
        opts.actionOnExistingFile = QgsVectorFileWriter.CreateOrOverwriteLayer
    else:
        opts.actionOnExistingFile = QgsVectorFileWriter.CreateOrOverwriteFile

    result = QgsVectorFileWriter.writeAsVectorFormatV3(
        layer,
        path,
        QgsProject.instance().transformContext(),
        opts,
    )
    if result[0] != QgsVectorFileWriter.NoError:
        raise Exception(
            "Error escribiendo {} ({}): {}".format(path, driver, result)
        )


def reopen_and_validate(path, expected, layer_name, provider="ogr"):
    layer = QgsVectorLayer(path, layer_name, provider)
    if not layer.isValid():
        raise Exception("QGIS no pudo abrir {}".format(path))
    count = layer.featureCount()
    if count != expected:
        raise Exception(
            "El archivo {} se escribió incompleto: esperadas {} / leídas {}".format(
                path, expected, count
            )
        )
    return layer


# -----------------------------------------------------------------------------
# PROCESO PRINCIPAL
# -----------------------------------------------------------------------------

input_path, _ = QFileDialog.getOpenFileName(
    None, "Selecciona un KML o KMZ", "", "KML/KMZ (*.kml *.kmz)"
)
if not input_path:
    raise Exception("Proceso cancelado.")

output_folder = QFileDialog.getExistingDirectory(None, "Selecciona la carpeta de salida")
if not output_folder:
    raise Exception("Proceso cancelado.")

base = os.path.splitext(os.path.basename(input_path))[0]
base = re.sub(r"[^\w\-]+", "_", base).strip("_") or "KML"

docs = load_kml_documents(input_path)
info = collect_records(docs)
records_by_kind = info["records"]
attr_order = info["attr_order"]
all_records = records_by_kind["polygon"] + records_by_kind["line"] + records_by_kind["point"]

if not all_records:
    raise Exception("No se encontraron geometrías compatibles en los Placemark.")

attr_types = {name: infer_type(all_records, name) for name in attr_order}
shp_chunks = make_shp_chunks(attr_order, attr_types, all_records)
active_kinds = [k for k in ("polygon", "line", "point") if records_by_kind[k]]

gpkg_path = os.path.join(output_folder, base + "_FINAL.gpkg")
report_path = os.path.join(output_folder, base + "_VALIDACION.txt")
fieldmap_path = os.path.join(output_folder, base + "_CAMPOS_SHP.txt")

# Eliminar GPKG previo, si no está bloqueado.
if os.path.exists(gpkg_path):
    try:
        os.remove(gpkg_path)
    except Exception:
        raise Exception(
            "No se puede reemplazar el GeoPackage. Quita/cierra la capa {} y vuelve a ejecutar.".format(gpkg_path)
        )

shp_paths = []
qml_paths = []
shp_maps = {}
gpkg_layer_names = []

# 1) SHP PRIMERO. Si falla, no te deja solo un GPKG y nada más.
for kind in active_kinds:
    suffix = "" if len(active_kinds) == 1 else "_" + kind.upper()
    shp_name = base + "_FINAL" + suffix
    shp_path = os.path.join(output_folder, shp_name + ".shp")

    shp_mem, shp_map = build_layer(
        records_by_kind[kind], kind, shp_name, attr_order, attr_types,
        for_shp=True, shp_chunks=shp_chunks
    )
    write_vector(shp_mem, shp_path, "ESRI Shapefile")

    final_shp = reopen_and_validate(
        shp_path, len(records_by_kind[kind]), shp_name
    )
    apply_renderer(final_shp, kind, shp_map)
    qml_path = os.path.splitext(shp_path)[0] + ".qml"
    final_shp.saveNamedStyle(qml_path)
    QgsProject.instance().addMapLayer(final_shp)

    shp_paths.append(shp_path)
    qml_paths.append(qml_path)
    shp_maps[kind] = shp_map

# 2) GeoPackage maestro con campos completos.
first = True
for kind in active_kinds:
    layer_name = "{}_{}".format(base, kind.upper())
    gpkg_mem, gpkg_map = build_layer(
        records_by_kind[kind], kind, layer_name, attr_order, attr_types,
        for_shp=False
    )
    write_vector(
        gpkg_mem,
        gpkg_path,
        "GPKG",
        layer_name=layer_name,
        overwrite_layer=(not first),
    )
    first = False
    gpkg_layer_names.append(layer_name)

# 3) Mapa de campos SHP.
with open(fieldmap_path, "w", encoding="utf-8") as f:
    f.write("MAPA DE CAMPOS SHAPEFILE\n")
    f.write("=" * 70 + "\n\n")
    f.write("Si un texto original supera 254 caracteres, se divide en varios campos.\n\n")
    for kind in active_kinds:
        f.write("[{}]\n".format(kind.upper()))
        mp = shp_maps[kind]
        for key in ("PM_NO", "KML_ID", "KML_NAME", "STYLE_ID", "PARTS"):
            f.write("{} -> {}\n".format(key, mp[key]))
        for original, chunks in mp["__SHP_ATTR_CHUNKS__"].items():
            f.write("{} -> {}\n".format(
                original,
                ", ".join(x[0] for x in chunks)
            ))
        for name, _ in STYLE_FIELDS:
            f.write("{} -> {}\n".format(name, mp[name]))
        f.write("\n")

# 4) Validación.
fill_colors = set(tuple(rec["style"]["fill"]) for rec in all_records)
style_ids = set(rec["STYLE_ID"] for rec in all_records if rec["STYLE_ID"])

with open(report_path, "w", encoding="utf-8") as f:
    f.write("VALIDACIÓN KML/KMZ -> SHP/GPKG\n")
    f.write("=" * 70 + "\n\n")
    f.write("Archivo: {}\n".format(input_path))
    f.write("Documentos KML internos: {}\n".format(len(docs)))
    f.write("Placemark encontrados: {}\n".format(info["placemark_count"]))
    f.write("Placemark sin geometría compatible: {}\n".format(len(info["empty_placemarks"])))
    f.write("Style encontrados: {}\n".format(info["style_count"]))
    f.write("StyleMap encontrados: {}\n".format(info["stylemap_count"]))
    f.write("Estilos usados distintos: {}\n".format(len(style_ids)))
    f.write("Colores de relleno distintos: {}\n".format(len(fill_colors)))
    f.write("Campos originales detectados: {}\n\n".format(len(attr_order)))

    for kind in ("polygon", "line", "point"):
        f.write("{}: {} entidades / {} partes\n".format(
            kind, len(records_by_kind[kind]), info["part_counts"][kind]
        ))

    f.write("\nCampos:\n")
    for name in attr_order:
        f.write("  - {} ({})\n".format(name, attr_types[name]))

    f.write("\nSHP:\n")
    for p in shp_paths:
        f.write("  {}\n".format(p))
    f.write("\nQML:\n")
    for p in qml_paths:
        f.write("  {}\n".format(p))
    f.write("\nGPKG:\n  {}\n".format(gpkg_path))

summary = [
    "Conversión terminada correctamente.",
    "",
    "Placemark encontrados: {}".format(info["placemark_count"]),
    "Campos detectados: {}".format(len(attr_order)),
    "Estilos usados: {}".format(len(style_ids)),
    "Colores de relleno: {}".format(len(fill_colors)),
]
for kind in active_kinds:
    summary.append(
        "{}: {} entidades / {} partes".format(
            kind.capitalize(), len(records_by_kind[kind]), info["part_counts"][kind]
        )
    )
summary += [
    "",
    "SHP generado: {}".format(", ".join(os.path.basename(p) for p in shp_paths)),
    "GeoPackage: {}".format(os.path.basename(gpkg_path)),
    "",
    "Se cargó el SHP final en el proyecto y se guardó su QML de colores.",
]

print("\n".join(summary))
print("Reporte:", report_path)
print("Mapa de campos:", fieldmap_path)
QMessageBox.information(None, "Conversión terminada", "\n".join(summary))
