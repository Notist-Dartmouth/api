import React, {Component} from 'react';
import {Card, CardActions, CardHeader, CardText, CardMedia, CardTitle} from 'material-ui/Card';
import {
  deepOrange400,
  blueGrey700,
  teal200,
  grey100, grey300, grey400, grey500, grey900,
  cyan500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import {MdComment, MdCreate, MdForum, MdSettings, MdUnfoldMore, MdGroup} from 'react-icons/lib/md';
// import RaisedButton from 'material-ui/RaisedButton';

const styles = {
  overlayContainer: {
        position: 'relative',
        left: '70%',
      },

  annotationTextStyle: {
    position: 'relative',
    fontSize: 14,
    clear: 'both',
  },

  articleTitleTextStyle: {
    fontSize: 26,
    lineHeight: 1,
    // bottomMargin: '500px', // not working
  },

  articleTextStyle: {
    fontSize: 15,
    fontFamily: 'monospace',
    // fontFamily: "Roboto",
    // fontWeight: 400,
    // font: "Roboto Italic",
  },

  cardHeaderStyle: {
    position: 'relative',
    maxWidth: '70%',
    marginRight: 0,
    paddingRight: 0,
    float: 'left',
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
    float: 'right',
    paddingTop: '3%',
    paddingRight: '3%',
  }

}

class ArticleCard extends React.Component {
  constructor(props) {
    super(props);
    this.title = props.title;
    this.subtitle = props.subtitle;
    this.annotationContent = props.annotationContent;
    this.numUsers = props.numUsers;
    this.numAnnotations = props.numAnnotations;
    this.numReplies = props.numReplies;
    this.username = props.username;
    this.points = props.points;
    this.timeSince = props.timeSince;
  }

  render() {
    return (
      <Card style={styles.cardStyle}>
        <CardHeader
          style={styles.cardHeaderStyle}
          titleStyle={styles.articleTitleTextStyle}
          title={this.title}
          subtitleStyle={styles.articleTextStyle}
          subtitle={this.subtitle}

        />
      <aside style={styles.articleInfoBar}>
        <span><MdGroup/> {"   " + this.numUsers} users  </span>
       <span><MdComment /> {"   " + this.numAnnotations} annotations  </span>
       <span><MdForum /> {"   " + this.numReplies} replies</span>
        <CardMedia
        // overlayContainerStyle={styles.overlayContainer}
        // overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
        >
        <img src="https://www.bennadel.com/images/header/photos/pascal_precht.jpg" />
        </CardMedia>
      </aside>
        <CardText expandable={false} style= {styles.annotationTextStyle}>
          {this.annotationContent}
        </CardText>
        <CardActions>
          <FlatButton label="See more" />
        </CardActions>
      </Card>
    );
  }
}

ArticleCard.propTypes = {
  title: React.PropTypes.string.isRequired,
  subtitle: React.PropTypes.string.isRequired,
  annotationContent: React.PropTypes.string.isRequired,
  numUsers: React.PropTypes.number.isRequired,
  numAnnotations: React.PropTypes.number.isRequired,
  numReplies: React.PropTypes.number.isRequired,
  username: React.PropTypes.string.isRequired,
  points: React.PropTypes.number.isRequired,
  timeSince: React.PropTypes.string.isRequired,
}

export default ArticleCard;
