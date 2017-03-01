import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import noop from 'lodash/noop';
import flow from 'lodash/flow';
import translate from '../i18n/Translate';
import { ListItem } from 'react-toolbox/lib/list';
import moment from 'moment';
import icons from '../constants/icons';
import md5 from 'md5';
import { getCurrentLanguageInfo } from '../selectors';

const stateToProps = state => ({
    languageInfo: getCurrentLanguageInfo(state)
});

class SessionTile extends Component {
    getGravatar(client) {
        return `https://www.gravatar.com/avatar/${md5(client)}?d=identicon`;
    }

    render() {
        const { session, strings, languageInfo } = this.props;
        const lastJoined = moment(session.lastJoin)
            .locale(languageInfo ? languageInfo.iso : 'en')
            .fromNow();
        const name = session.name || strings.defaultSessionName;

        return (
            <ListItem
              avatar={this.getGravatar(name)}
              caption={ name }
              legend={ lastJoined }
              rightIcon={icons.open_in_new}
              onClick={this.props.onClick}
              selectable
            />
        );
    }
}

SessionTile.propTypes = {
    session: PropTypes.object.isRequired,
    languageInfo: PropTypes.object,
    strings: PropTypes.object,
    onClick: PropTypes.func
};

SessionTile.defaultProps = {
    session: null,
    languageInfo: null,
    onClick: noop,
    strings: {
        defaultSessionName: 'My Retrospective'
    }
};

const decorators = flow([
    connect(stateToProps),
    translate('SessionName')
]);

export default decorators(SessionTile);
