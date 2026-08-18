import { DiscussionEmbed } from 'disqus-react';

export default function DisqusComments({ identifier = 'review', title = 'Opiniones FibraMap' }) {
  return (
    <DiscussionEmbed
      shortname="fibramap"
      config={{ url: `https://alanmundler.github.io/fibramap-page/${identifier}`, identifier, title }}
    />
  );
}
