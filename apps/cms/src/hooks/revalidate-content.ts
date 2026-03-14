type RevalidateArgs = {
  doc?: {
    slug?: string;
  };
  collection?: {
    slug?: string;
  };
};

export function revalidateContent({ collection, doc }: RevalidateArgs): Promise<void> {
  console.info("[cms:revalidate]", {
    collection: collection?.slug,
    slug: doc?.slug,
  });

  return Promise.resolve();
}
