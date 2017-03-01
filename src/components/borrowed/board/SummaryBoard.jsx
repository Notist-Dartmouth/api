import React, { PropTypes, Component } from 'react';
import flow from 'lodash/flow';
import translate from '../../i18n/Translate';
import { connect } from 'react-redux';
import { getSortedWellPosts, getSortedNotWellPosts, getSortedIdeasPosts } from '../../selectors';
import { Card, CardTitle, CardText } from 'react-toolbox/lib/card';
import style from './SummaryBoard.scss';

const stateToProps = state => ({
    wellPosts: getSortedWellPosts(state),
    notWellPosts: getSortedNotWellPosts(state),
    ideasPosts: getSortedIdeasPosts(state)
});

class SummaryBoard extends Component {
    renderType(label, className, posts) {
        if (!posts.length) {
            return null;
        }
        return (
            <div style={{ margin: 30 }}>
                <Card>
                    <CardTitle className={className}>{ label }</CardTitle>
                    <CardText>
                        <ul style={{ marginLeft: 0, marginTop: 20, listStyleType: 'none' }}>
                            { posts.map(this.renderPost.bind(this)) }
                        </ul>
                    </CardText>
                </Card>
            </div>
        );
    }

    renderPost(post) {
        return (
            <li key={post.id}>
                <span className={style.like}>+{post.likes.length}</span>&#9;
                <span className={style.dislike}>-{post.dislikes.length}</span>&#9;
                {post.content}
            </li>
        );
    }

    render() {
        const { wellPosts, notWellPosts, ideasPosts, strings } = this.props;

        if (!wellPosts.length && !notWellPosts.length && !ideasPosts.length) {
            return (
                <div className={style.summary}>
                    <h4 style={{ textAlign: 'center', marginTop: 50 }}>{strings.noPosts}</h4>
                </div>
            );
        }
        return (
            <div className={style.summary}>
                { this.renderType(strings.wellQuestion, style.well, wellPosts) }
                { this.renderType(strings.notWellQuestion, style.notWell, notWellPosts) }
                { this.renderType(strings.ideasQuestion, style.ideas, ideasPosts) }
            </div>
        );
    }
}

SummaryBoard.propTypes = {
    wellPosts: PropTypes.array.isRequired,
    notWellPosts: PropTypes.array.isRequired,
    ideasPosts: PropTypes.array.isRequired,
    strings: PropTypes.object
};

SummaryBoard.defaultProps = {
    wellPosts: [],
    notWellPosts: [],
    ideasPosts: [],
    strings: {
        notWellQuestion: 'What could be improved?',
        wellQuestion: 'What went well?',
        ideasQuestion: 'A brilliant idea to share?',
        vote: 'vote',
        votes: 'votes',
        noPosts: 'There are no posts to display'
    }
};

const decorators = flow([
    connect(stateToProps),
    translate('PostBoard'),
    translate('SummaryBoard'),
    translate('Post')
]);

export default decorators(SummaryBoard);
