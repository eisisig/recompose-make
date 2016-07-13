'use strict'

const React = require('react')
const forEach = require('lodash/forEach')
const isArray = require('lodash/isArray')
const keys = require('lodash/keys')
const map = require('lodash/map')
const pick = require('lodash/pick')
const reduce = require('lodash/reduce')
const recompose = require('recompose')

const compose = recompose.compose
const renderNothing = recompose.renderNothing

const whitelist = [
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
 * @param args
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
module.exports = function make ( ...args ) {

	let enhancements, displayName

	if ( args.length > 2 ) {
		console.warn('too many arguments')
		return compose(renderNothing())
	} else if ( args.length > 1 ) {
		displayName = args[ 0 ]
		enhancements = args[ 1 ]
	} else {
		enhancements = args[ 0 ]
	}

	if ( !enhancements.render ) {
		console.warn('render method is required for make components')
		return compose(renderNothing())
	}

	let component = {}

	const allowedMethods = pick(enhancements, whitelist)

	allowedMethods.setDisplayName = 'Component'

	if ( displayName || allowedMethods.displayName ) {
		allowedMethods.setDisplayName = displayName || allowedMethods.displayName
	}

	if ( allowedMethods.propTypes ) {
		allowedMethods.setPropTypes = allowedMethods.propTypes
	}

	const mappedMethods = reduce(keys(allowedMethods), ( prev, method ) => {
		if ( recompose.hasOwnProperty(method) ) {

			const enhanceMethod = allowedMethods[ method ]

			if ( isArray(enhanceMethod) ) {
				forEach(enhanceMethod, state => prev.push(recompose[ method ](...state)))
			} else {
				prev.push(recompose[ method ](enhanceMethod))
			}

		}
		return prev
	}, [])

	component.render = function () {
		// const classes = { classes: cx({ name: enhancements.displayName }) }
		return enhancements.render({ ...this.props, ...{ props: this.props } }, this.refs, this.context)
	}

	return compose(...mappedMethods)(React.createClass(component))
}
