import MunicipalityLocator from "@/components/Tool/MunicipalityLocator/MunicipalityLocator";

export default async function Page({ searchParams }) {
  const params = await searchParams;

  return (
    <MunicipalityLocator
      initialMunicipio={typeof params?.municipio === "string" ? params.municipio : ""}
      initialZone={{ field: params?.nivel, value: params?.zona }}
      initialOnlyIndigenous={params?.indigenas === "1"}
    />
  );
}
