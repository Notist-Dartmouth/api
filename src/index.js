import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {
  deepOrange400,
  blueGrey700,
  teal200,
  grey100, grey300, grey400, grey500, grey900,
  cyan500,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
// https://www.materialui.co/colors
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Chip from 'material-ui/Chip';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import Media from 'react-media';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import ArticleCard from './components/ArticleCard.js'

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: deepOrange400,
    primary2Color: blueGrey700,
    primary3Color: teal200,
    accent1Color: grey900,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
});

injectTapEventPlugin();

const ARTICLEURL = 'http://www.theonion.com/article/trump-spends-entire-classified-national-security-b-53550';
const ARTICLETITLE = 'Fans of Hard Hitting News';
const ARTICLEPUBLISHER = 'The Onion (satire)';
const NAVBARHEIGHT = '75px';
const DEFAULTWIDTH = '380px';
const MINSIDEBARWIDTH = '380px';

const ANNOTATIONS = {
  Mark: {
    text: 'Lorem Ipsum',
  },
};
  //  Maybe this should be an array of arrays of strings?

//  CSS for components
const styles = {
  title: {
    zIndex: 100,
    fontSize: 22,
    color: white,
    paddingLeft: '20px',
    top: '15px',
  },

  navBar: {
    width: '100%',
    height: NAVBARHEIGHT,
    position: 'fixed',
    backgroundColor: deepOrange400,
    top: '0px',
    left: '0px',
  },

  iframeContainer: {
    height: '55%',
    paddingLeft: '25px',
    paddingRight: '25px',
  },

  iframe: {
    border: 'rgba(255, 255, 255, 1)',  // Transparent
    height: '100%',
    minWidth: '330px',
    backgroundColor: 'rgba(255, 255, 255, 1)',  // Transparent
  },

  iconContainer: {
    height: NAVBARHEIGHT,
  },

  rightSidebarText: {
    fontSize: 16,
    paddingLeft: '25px',
    paddingRight: '25px',
  },

  rightSidebar: {
    position: 'fixed',
    backgroundColor: grey100,
    width: '23%',
    minWidth: '23%',
    height: '100%',
    top: NAVBARHEIGHT,
    right: '0px',
  },

  leftSidebarText: {
    fontSize: 16,
    paddingLeft: '25px',
    paddingRight: '25px',
    color: white,
  },

  leftSidebar: {
    position: 'fixed',
    backgroundColor: blueGrey700,
    width: '18%',
    minWidth: '18%',
    height: '100%',
    top: NAVBARHEIGHT,
    left: '0px',
  },

  // card: {
  //   position: 'fixed',
  //   height: '200px',
  //   top: '100px',
  //   left: '330px',
  //   right: '410px',
  // },

  break: {
    color: white,
  },

  cardHeader: {
    color: grey500,
  },
};

// not currently being rendered -- needs to for group / feed view
class SimpleDrawer extends Component {

  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  handleToggle = () => this.setState({ open: !this.state.open });

  render() {
    return (
      <div>
        <RaisedButton
          label="Toggle Drawer"
          onTouchTap={this.handleToggle}
        />
        <Drawer open={this.state.open}>
          <MenuItem>Menu Item</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
        </Drawer>
      </div>
    );
  }
}

const otherStyles = {
  smallIcon: {
    width: 36,
    height: 36,
  },
  small: {
    width: 72,
    height: 72,
    padding: 0,
  },
};

class MyCard extends React.Component {
  constructor(props) {
    super(props);
    this.title = props.title;
    this.subtitle = props.subtitle;
    this.annotationContent = props.annotationContent;
  }

  render() {
    return (

      <MuiThemeProvider muiTheme={muiTheme}>
        <Card>
          <CardHeader style= {styles.cardHeader}
            title={this.title}
            subtitle={this.subtitle}
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={false}>
            {this.annotationContent}
          </CardText>
          <CardActions>
            <FlatButton label="See more" />
          </CardActions>
        </Card>
      </MuiThemeProvider>
    );
  }
}

class ChipExampleArray extends React.Component {

  constructor(props) {
    super(props);
    this.state = { chipData: [
      { key: 0, label: 'politics' },
      { key: 1, label: '@cblanc' },
      { key: 2, label: 'X' },
      { key: 3, label: 'Y' },
    ] };
    this.styles = {
      chip: {
        margin: 4,
      },
      wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
      },
    };
  }

  handleRequestDelete = (key) => {
    if (key === 3) {
      alert('Are you sure you want to delete _?');
      return;
    }

    this.chipData = this.state.chipData;
    const chipToDelete = this.chipData.map((chip) => chip.key).indexOf(key);
    this.chipData.splice(chipToDelete, 1);
    this.setState({ chipData: this.chipData });
  };

  renderChip(data) {
    return (
      <Chip
        key={data.key}
        onRequestDelete={() => this.handleRequestDelete(data.key)}
        style={this.styles.chip}
      >
        {data.label}
      </Chip>
    );
  }

  render() {
    return (
      <div style={this.styles.wrapper}>
        {this.state.chipData.map(this.renderChip, this)}
      </div>
    );
  }
}

class NavBar extends Component {
  render() {
    return (
      <div style={styles.navBar}>
        <p style={styles.title}>{ARTICLETITLE}</p>
      </div>
    );
  }
}


class LeftSideBar extends Component {
  render() {
    return (
      <div id="leftSidebar" style={styles.leftSidebar}>
        <p style={styles.leftSidebarText}>ethan 994</p>
      </div>
    );
  }
}

class RightSideBar extends Component {
  render() {
    return (
      <div id="rightSidebar" style={styles.rightSidebar}>
        <p style={styles.rightSidebarText}>Will eventually be chat!</p>
      </div>
    );
  }
}

class MiddleContent extends Component {
  render() {
    return (
      <div style={styles.card}>
        <ArticleCard id="card1"
        title="Officials Struggling To Condense Trump’s Intelligence Briefing Down To One Word"
        subtitle="The president tends to grow frustrated if crucial intelligence is not delivered within the first seven letters or so. We recently gave him a briefing that consisted only of the term ‘nuclear proliferation,’ but he clearly became distracted by the end of the"
        annotationContent= "here goes the annotation content"
        username= "cblanc"
        points={16}
        timeSince = "4 hours"
        numUsers={8}
        numAnnotations={6}
        numReplies={4}
        />
      </div>
    );
  }
}


class App extends Component {

  render() {
    return (
      <div>
        <MuiThemeProvider>
          <RightSideBar />
        </MuiThemeProvider>
        <MuiThemeProvider>
          <LeftSideBar />
        </MuiThemeProvider>
        <MuiThemeProvider>
          <NavBar />
        </MuiThemeProvider>
        <MuiThemeProvider>
          <MiddleContent />
        </MuiThemeProvider>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('main'));
