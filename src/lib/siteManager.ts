import rawSites from "../data/sites.json";

export type SiteType = {
  id: string;
  name: string;
  slug: string;
};

const sites: SiteType[] = rawSites;

export const getSites = async (): Promise<SiteType[]> => {
  return sites;
};

export const getSiteById = async (
  id: string
): Promise<SiteType | undefined> => {
  return sites.find((site) => site.id === id);
};
