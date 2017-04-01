import React from 'react';
import Helmet from 'react-helmet';
import { StyleSheet, css } from 'aphrodite';
import TopNav from './TopNav';
import LeftNav from './LeftNav';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ArticleCard from './ArticleCard';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
// import ReactVote from './ReactVote';

// only for Card test
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

injectTapEventPlugin();

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    top: 90,
    left: '22%',
    color: '#000',
    margin: '2rem auto',
    padding: '0 1rem',
    // width: '70%'
  },
  title: {
    color: '#000',
    maxWidth: 300,
    fontWeight: 'bold',
    fontSize: 56,
  },
  footer: {
    margin: '4rem auto',
    textAlign: 'center',
    color: '#b7b7b7',
  },
  footerLink: {
    display: 'inline-block',
    color: '#000',
    textDecoration: 'none',
  },
});

const groupList = [
  {
    id: 'abcd190d',
    groupName: 'Group 1',
    groupLink: 'url',
    icon: 'iconName'
  },
  {
    id: 'bacd190d',
    groupName: 'Group 2',
    groupLink: 'url',
    icon: 'iconName'
  },
  {
    id: 'dacd190d',
    groupName: 'Group 3',
    groupLink: 'url',
    icon: 'iconName'
  }
]

const App = ({ children }) => (
  <div className={css(styles.root)}>
    <Helmet title="Notist" titleTemplate="%s - Annotate Everything" />
    <LeftNav
      groupList={groupList}
    />
  {/*
    personalList={personalList}
    exploreList={exploreList}
    followingList={followingList}
    */}
    <TopNav
      currentFeedName="Name of the group"
      subscribed={false}
      numFeedMembers={8}
      numNotifications={9}
    />
    <MuiThemeProvider>
      <ArticleCard id="card1"
        title="Officials Struggling To Condense Trump’s Intelligence Briefing Down To One Word"
        domain="theonion.com (satire)"
        subtitle="The president tends to grow frustrated if crucial intelligence is not delivered within the first seven letters or so. We recently gave him a briefing that consisted only of the term ‘nuclear proliferation,’ but he clearly became distracted by the end of the first word, so we shortened it to simply read bomb"
        annotationContent= "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque mattis mollis elit, sit amet facilisis erat. Mauris condimentum ex vel neque cursus, eu bibendum velit eleifend. Praesent molestie odio eget interdum ultricies. Nullam vitae dictum sapien, condimentum ultrices elit."
        image = "http://i.onionstatic.com/onion/5597/9/16x9/1600.jpg"
        username= "merwin"
        points={16}
        timeSince = "2 hours"
        numUsers={8}
        numAnnotations={6}
        numReplies={4}
        currentVotes={2}
      />
    </MuiThemeProvider>
    <p>Everything beneath the card on the 'Example Feed' page is rendered from server/fakeDB.js</p>
    {children}
    <footer className={css(styles.footer)}>
      Copyright © 2017 <a className={css(styles.footerLink)} href="http://notist.io/" target="_blank" rel="noopener noreferrer">Notist</a>
    </footer>
  </div>
);

export default App;
