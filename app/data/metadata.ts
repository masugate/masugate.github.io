import type { Metadata } from "next";
import type { PublishedArticle } from "./article-types";
import { isAvailable } from "./contracts";
import { masugateSite } from "./masugate-site";

export interface MasuGatePageMetadataInput {
  title: string;
  description: string;
}

type MasuGateArticleMetadataInput = Pick<
  PublishedArticle,
  "title" | "summary" | "publishedAt" | "updatedAt" | "labels"
>;

function socialImages() {
  const image = masugateSite.metadata.socialImage;

  if (!isAvailable(image)) {
    return [];
  }

  return [
    {
      url: image.value.path,
      width: image.value.width,
      height: image.value.height,
      alt: image.value.alt,
    },
  ];
}

function asTimestamp(date: string): string {
  return `${date}T00:00:00.000Z`;
}

function brandedSocialTitle(title: string): string {
  if (
    title === masugateSite.metadata.defaultTitle ||
    title.endsWith(`— ${masugateSite.name}`)
  ) {
    return title;
  }

  return `${title} — ${masugateSite.name}`;
}

export function createMasuGatePageMetadata({
  title,
  description,
}: MasuGatePageMetadataInput): Metadata {
  const images = socialImages();
  const socialTitle = brandedSocialTitle(title);

  return {
    title,
    description,
    openGraph: {
      title: socialTitle,
      description,
      siteName: masugateSite.name,
      type: "website",
      images,
    },
    twitter: {
      card: images.length > 0 ? "summary_large_image" : "summary",
      title: socialTitle,
      description,
      images,
    },
  };
}

export function createMasuGateSiteMetadata(): Metadata {
  const metadata = createMasuGatePageMetadata({
    title: masugateSite.metadata.defaultTitle,
    description: masugateSite.metadata.description,
  });

  return {
    ...metadata,
    title: {
      default: masugateSite.metadata.defaultTitle,
      template: masugateSite.metadata.titleTemplate,
    },
  };
}

export function createMasuGateArticleMetadata(
  article: MasuGateArticleMetadataInput,
): Metadata {
  const metadata = createMasuGatePageMetadata({
    title: article.title,
    description: article.summary,
  });

  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: asTimestamp(article.publishedAt),
      modifiedTime: article.updatedAt
        ? asTimestamp(article.updatedAt)
        : undefined,
      tags: [...article.labels],
    },
  };
}
