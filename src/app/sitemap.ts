import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.quotemateai.com.au",
      lastModified: new Date(),
    },
  ];
}
