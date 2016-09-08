'use strict'

var React = require('react')
var forEach = require('lodash/forEach')
var ref = require('react-redux');
var connect = ref.connect;
var isArray = require('lodash/isArray')
var keys = require('lodash/keys')
var map = require('lodash/map')
var pick = require('lodash/pick')
var reduce = require('lodash/reduce')
var recompose = require('recompose')

var compose = recompose.compose
var renderNothing = recompose.renderNothing

var whitelist = [
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
module.exports = function make () {
	var args = [], len = arguments.length;
	while ( len-- ) args[ len ] = arguments[ len ];


	var enhancements, displayName

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

	var component = {}

	var allowedMethods = pick(enhancements, whitelist)

	allowedMethods.setDisplayName = 'Component'

	if ( displayName || allowedMethods.displayName ) {
		allowedMethods.setDisplayName = displayName || allowedMethods.displayName
	}

	if ( allowedMethods.propTypes ) {
		allowedMethods.setPropTypes = allowedMethods.propTypes
	}

	var mappedMethods = reduce(keys(allowedMethods), function ( prev, method ) {
		if ( recompose.hasOwnProperty(method) ) {

			var enhanceMethod = allowedMethods[ method ]

			if ( method === 'pure' && enhanceMethod === true ) {
				prev.push(recompose[ method ])
			} else if ( isArray(enhanceMethod) ) {
				forEach(enhanceMethod, function (state) { return prev.push(recompose[ method ].apply(recompose, state)); })
			} else {
				prev.push(recompose[ method ](enhanceMethod))
			}

		}
		return prev
	}, [])

	component.render = function () {
		return enhancements.render(Object.assign({}, this.props, { props: this.props }), this.refs, this.context)
	}

	if ( allowedMethods.connect || allowedMethods.connect === true ) {
		var connectFn = allowedMethods.connect === true ? connect() : connect(allowedMethods.connect)
		return connectFn(compose.apply(void 0, mappedMethods)(React.createClass(component)))
	} else {
		return compose.apply(void 0, mappedMethods)(React.createClass(component))
	}

}

