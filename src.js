'use strict'

const React = require('react')
const forEach = require('lodash/forEach')
const { connect } = require('react-redux')
const isArray = require('lodash/isArray')
const keys = require('lodash/keys')
const map = require('lodash/map')
const pick = require('lodash/pick')
const reduce = require('lodash/reduce')
const recompose = require('recompose')

const compose = recompose.compose
const renderNothing = recompose.renderNothing

const whitelist = [
	'defaultProps',
	'setPropTypes',
	'setDisplayName',
	'displayName',
	'propTypes',
	'mapProps',
	'renameProps',
	'renameProp',
	'flattenProp',
	'onlyUpdateForKeys',
	'onlyUpdateForPropTypes',
	'withState',
	'withProps',
	'withPropsOnChange',
	'withHandlers',
	'withReducer',
	'withContext',
	'getContext',
	'createEagerElement',
	'shouldUpdate',
	'pure',
	// mapped to correct method
	'lifecycle',
	'connect',
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

			if ( method === 'pure' && enhanceMethod === true ) {
				prev.push(recompose[ method ])
			} else if ( isArray(enhanceMethod) ) {
				forEach(enhanceMethod, state => prev.push(recompose[ method ](...state)))
			} else {
				prev.push(recompose[ method ](enhanceMethod))
			}

		}
		return prev
	}, [])

	component.render = function () {
		return enhancements.render({ ...this.props, ...{ props: this.props } }, this.refs, this.context)
	}

	if ( allowedMethods.connect || allowedMethods.connect === true ) {
		const connectFn = allowedMethods.connect === true ? connect() : connect(allowedMethods.connect)
		return connectFn(compose(...mappedMethods)(React.createClass(component)))
	} else {
		return compose(...mappedMethods)(React.createClass(component))
	}

}
