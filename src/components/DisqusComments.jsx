import React from 'react';
import { DiscussionEmbed } from 'disqus-react';

export default function DisqusComments() {
  const disqusConfig = {
    url: "https://fibramap.vercel.app/review",
    identifier: "review",
    title: "Opiniones FibraMap",
  };
  return <DiscussionEmbed shortname="fibramap" config={disqusConfig} />;
}
