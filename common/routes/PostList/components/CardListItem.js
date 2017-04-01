import React from 'react'
import { Link } from 'react-router'
import { StyleSheet, css } from 'aphrodite'
import { Card, CardActions, CardMedia } from 'material-ui/Card';
import { MdComment, MdForum, MdGroup } from 'react-icons/lib/md';
import { yellow200 } from 'material-ui/styles/colors';
import RaisedButton from 'material-ui/RaisedButton';
import Upvote from './Upvote';

// const CardListItem = ({ card }) => (
//   <div className={css(styles.root)}>
//     <h3><Link to={`/card/${card.slug}`} className={css(styles.title)}> {card.title} </Link></h3>
//   </div>
// )

const CardListItem = ({ card }) => (
  <Card style={css(styles.cardStyle)}>
    <div style={css(styles.cardHeaderStyle)}>
      <Link to={`/card/${card.slug}`} style={css(styles.articleTitleTextStyle)}>{card.title}</Link>
      <span style={css(styles.domainTextStyle)}><br></br>{card.domain}</span>
      <span style={css(styles.articleTextStyle)}><br></br>"{card.subtitle}"</span>
      <br style={{lineHeight: 2}}></br>
      <div class="vote" style={{float: 'left'}}>
        <Upvote beforeContent={card.currentVotes}/>
      </div>
      <div style={css(styles.annotationAndInfo)}>
        <span style={{fontWeight: 900, padding: 10}}>{card.username}</span>
        <span style={{fontStyle: 'italic', padding: 10}}>{card.points} points</span>
        <span> {card.timeSince} ago</span>
        <span style={css(styles.annotationTextStyle)}><br></br>{card.annotationContent}</span>
      </div>
      </div>
      <aside style={css(styles.articleInfoBar)}>
        <span><MdGroup/> {"   " + card.numUsers} users  </span>
        <span><MdComment /> {"   " + card.numAnnotations} annotations  </span>
        <span><MdForum /> {"   " + card.numReplies} replies</span>
        <CardMedia>
          <img src={card.image} />
        </CardMedia>
      </aside>
    <CardActions style={{clear: 'both', position: 'relative', left: '41%', padding: '3%'}}>
      <RaisedButton style={{top: '10%'}} label="See more"/>
    </CardActions>
  </Card>
)

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'relative',
    left: '70%',
  },

  annotationTextStyle: {
    position: 'relative',
    fontSize: 14,
    left: '2%',
  },

  articleTitleTextStyle: {
    fontWeight: 700,
    fontSize: 26,
    lineHeight: 1,
  },

  articleTextStyle: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: 100,
    backgroundColor: yellow200,
  },

  cardHeaderStyle: {
    position: 'relative',
    float: 'left',
    maxWidth: '65%',
    paddingLeft: '3%',
    top: 20,
  },

  domainTextStyle: {
    fontSize: 10,
    textDecoration: 'underline',
  },

  cardStyle: {
    position: 'relative',
    top: 80,
    left: '18%',
    width: '56%',
    marginTop: 20,
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 20,
  },

  articleInfoBar: {
    float: 'right',
    lineHeight: 2,
    textAlign: 'center',
    maxWidth: '27%',
    paddingTop: '3%',
    paddingRight: '3%',
  },

  annotationAndInfo: {
    paddingLeft: '5%',
  }
})

export default CardListItem
