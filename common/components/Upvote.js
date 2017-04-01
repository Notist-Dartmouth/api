import React, {Component} from 'react';
import {GoTriangleUp, GoTriangleDown} from 'react-icons/lib/go';
import {
  green500, red500,
} from 'material-ui/styles/colors';

let noop = () => {};

class Upvote extends React.Component {
  constructor(props) {
    super(props);
    this.className = 'react-upvote';

    this.voteStatus = 0;
    this.upvoteCount = 0;

    this.shouldAllow = null;
    this.onDisallowed = null;

    this.onUpvote = null;
    this.onDownvote = null;
    this.onRemoveVote = null;

    this.upvoteContent = null;
    this.downvoteContent = null;

    this.updating = false;

  }

    // getInitialState() {
    //     return {
    //         updating: false,
    //         voteStatus: this.props.voteStatus
    //     };
    // }

    componentWillReceiveProps(nextProps) {
        let oldVoteStatus = this.props.voteStatus;
        let newVoteStatus = nextProps.voteStatus;

        // don't update unless post's vote status changes
        if (oldVoteStatus === newVoteStatus) {
            return;
        }

        this.setState({
            updating: false,
            voteStatus: nextProps.voteStatus
        });
    }

    allowed() {
        let shouldAllow = this.props.shouldAllow;
        let onDisallowed = this.props.onDisallowed || noop;

        if (shouldAllow && !shouldAllow()) {
            onDisallowed();
            return false;
        }

        return true;
    }

    vote(nextStatus) {
        if (this.state.updating || !this.allowed()) {
            return;
        }

        let prevStatus = this.state.voteStatus;
        let onUpvote = this.props.onUpvote || noop;
        let onDownvote = this.props.onDownvote || noop;
        let onRemoveVote = this.props.onRemoveVote || noop;

        if (prevStatus === nextStatus) {
            // undo current vote
            onRemoveVote();
            nextStatus = 0;
        } else {
            // add/change vote

            if (prevStatus !== 0 && nextStatus !== 0) {
                // undo previous vote first
                onRemoveVote();
            }

            // add new vote
            if (nextStatus === 1) {
                onUpvote();
            } else {
                onDownvote();
            }
        }

        this.setState({
            // update voteStatus
            voteStatus: nextStatus,
            // wait for action to complete before allowing upvote
            updating: true
        });
    }

    render() {
        // let voteStatus = this.state.voteStatus;

        // let upvoteCx = cx(this.props.className, {
        //     'upvoted': voteStatus === 1,
        //     'downvoted': voteStatus === -1,
        //     'updating': this.state.updating
        // });

        let upvoteContent = this.props.upvoteContent || <div className="upvote"><GoTriangleUp size={30} color={green500}/></div>;
        let downvoteContent = this.props.downvoteContent || <div className="downvote"><GoTriangleDown size={30} color={red500}/></div>;

        // let beforeContent = this.props.beforeContent || null;
        let beforeContent = this.props.beforeContent || 6;
        let afterContent = this.props.afterContent || null;

        return (
            <div className={ "upvoteCx" }>
                <div className="react-upvote-icons">
                    { upvoteContent && (
                        <div className="upvote" onClick={ () => this.vote(1) }>
                            { upvoteContent }
                        </div>
                    )}
                    <span> { beforeContent }</span>
                    { downvoteContent && (
                        <div className="downvote" onClick={ () => this.vote(-1) }>
                            { downvoteContent }
                        </div>
                    )}
                </div>
                { afterContent }
            </div>
        );
    }

}

export default Upvote;
