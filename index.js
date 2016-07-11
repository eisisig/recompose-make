'use strict'

var React = require('react')
var forEach = require('lodash/forEach')
var isArray = require('lodash/isArray')
var keys = require('lodash/keys')
var map = require('lodash/map')
var pick = require('lodash/pick')
var reduce = require('lodash/reduce')
var recompose = require('recompose')

var compose = recompose.compose
var renderNothing = recompose.renderNothing

var whitelist = [
	'mapProps',
	'withProps',
	'withPropsOnChange',
	'withHandlers',
	'defaultProps',
	'renameProp',
	'renameProps',
	'flattenProp',
	'withState',
	'withReducer',
	'shouldUpdate',
	'onlyUpdateForKeys',
	'onlyUpdateForPropTypes',
	'withContext',
	'getContext',
	'setDisplayName',
	'setPropTypes',
	'createEagerElement',
	// mapped to correct method
	'displayName',
	'propTypes',
]

/**
 * @method make
 * @param enhancements
 *
 * @example export const displayName = 'Button'
 * export const defaultProps = {
 *      label: '',
 *      type: 'button',
 * }
 * export const withHandlers = {
 *      onClick: props => props.handleClick
 * }
 * export const render = ({ type, label, onClick }) => <button onClick={ onClick } type={ type }>{ label }</button>
 * export default make({ displayName, defaultProps, render })
 */
module.exports = function make ( enhancements ) {

	if ( !enhancements.render ) {
		console.warn('render method is required for make components')
		return compose(renderNothing())
	}

	var component = {}

	var allowedMethods = pick(enhancements, whitelist)

	allowedMethods.setDisplayName = 'Component'

	if ( allowedMethods.displayName ) {
		allowedMethods.setDisplayName = allowedMethods.displayName
	}

	if ( allowedMethods.propTypes ) {
		allowedMethods.setPropTypes = allowedMethods.propTypes
	}

	var mappedMethods = reduce(keys(allowedMethods), function ( prev, method ) {
		if ( recompose.hasOwnProperty(method) ) {

			var enhanceMethod = allowedMethods[ method ]

			if ( isArray(enhanceMethod) ) {
				forEach(enhanceMethod, function (state) { return prev.push(recompose[ method ].apply(recompose, state)); })
			} else {
				prev.push(recompose[ method ](enhanceMethod))
			}

		}
		return prev
	}, [])

	component.render = function () {
		// const classes = { classes: cx({ name: enhancements.displayName }) }
		return enhancements.render(Object.assign({}, this.props, { props: this.props }), this.refs, this.context)
	}

	return compose.apply(void 0, mappedMethods)(React.createClass(component))
}

