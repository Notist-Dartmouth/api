import React from 'react';
import { Link } from 'react-router';
import { StyleSheet, css } from 'aphrodite';
import ArticleCard from '../../../components/ArticleCard';

const styles = StyleSheet.create({
  root: {
    margin: '0 auto 1.5rem',
  },
  title: {
    fontSize: 28,
    textDecoration: 'none',
    lineHeight: '1.2',
    margin: '0 0 1.5rem',
    color: '#000',
    transition: '.3s opacity ease',
    ':hover': {
      opacity: 0.5,
    },
  },
});

const PostListItem = ({ post }) => (
  <div className={css(styles.root)}>
    <Link to={`/post/${post.slug}`} className={css(styles.title)}>{post.title}</Link>
    <ArticleCard id="card1"
      title={post.title}
      domain={post.domain}
      subtitle={post.subtitle}
      annotationContent={post.annotationContent}
      image={post.image}
      username={post.username}
      points={post.points}
      timeSince={post.timeSince}
      numUsers={post.numUsers}
      numAnnotations={post.numAnnotations}
      numReplies={post.numReplies}
      currentVotes={post.currentVotes}
    />
  </div>
);

export default PostListItem;
