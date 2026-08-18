import React from 'react';
import { DiscussionEmbed } from 'disqus-react';

export default function DisqusCommentsPromo() {
  const disqusConfig = {
    url: "https://fibramap.vercel.app/promo",
    identifier: "promo",
    title: "Promociones FibraMap",
  };
  return <DiscussionEmbed shortname="fibramap" config={disqusConfig} />;
}
