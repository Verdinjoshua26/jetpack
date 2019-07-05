/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { Button } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { get, startsWith } from 'lodash';
import { withSelect } from '@wordpress/data';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import getSiteFragment from '../get-site-fragment';
import './store';

import './style.scss';

class UpgradeNudge extends Component {
	trackUpgradeClick() {
		const { planPathSlug } = this.props;
		analytics.tracks.recordEvent( 'jetpack_editor_block_upgrade_click', { planPathSlug } );
	}

	render() {
		const { planName, planPathSlug, postId, postType } = this.props;

		return (
			<div className="jetpack-upgrade-nudge">
				<Gridicon className="jetpack-upgrade-nudge__icon" icon="star" size={ 18 } />
				<div className="jetpack-upgrade-nudge__info">
					<span className="jetpack-upgrade-nudge__title">
						{ sprintf( __( 'Upgrade to %(planName)s', 'jetpack' ), {
							planName,
						} ) }
					</span>
					<span className="jetpack-upgrade-nudge__message">
						{ __( 'To make this block visible on your site', 'jetpack' ) }
					</span>
				</div>
				<Button
					className="jetpack-upgrade-nudge__button"
					href={ addQueryArgs(
						`https://wordpress.com/checkout/${ getSiteFragment() }/${ planPathSlug }`,
						{
							redirect_to: `/${ postType }/${ getSiteFragment() }/${ postId }`,
						}
					) }
					isDefault
					onClick={ this.trackUpgradeClick }
					target="_top"
				>
					{ __( 'Upgrade', 'jetpack' ) }
				</Button>
			</div>
		);
	}
}

export default withSelect( ( select, { plan: planSlug } ) => {
	const plan = select( 'wordpress-com/plans' ).getPlan( planSlug );

	// WP.com plan objects have a dedicated `path_slug` field, Jetpack plan objects don't
	// For Jetpack, we thus use the plan slug with the 'jetpack_' prefix removed.
	const planPathSlug = startsWith( planSlug, 'jetpack_' )
		? planSlug.substr( 'jetpack_'.length )
		: get( plan, [ 'path_slug' ] );

	return {
		planName: get( plan, [ 'product_name_short' ] ),
		planPathSlug,
		postId: select( 'core/editor' ).getCurrentPostId(),
		postType: select( 'core/editor' ).getCurrentPostType(),
	};
} )( UpgradeNudge );
