import React from 'react'
import { connect } from 'react-redux'
import * as recompose from 'recompose'
import { compact, pull, keys, omit, forEach, sortBy, isArray, pick, reduce } from 'lodash'

const recomposeMethods = [
	// 'branch',
	'defaultProps',
	'setDisplayName',
	'setPropTypes',
	'componentFromProp',
	'createEventHandler',
	'flattenProp',
	'getContext',
	'getDisplayName',
	'hoistStatics',
	'lifecycle',
	'mapProps',
	'mapPropsStream',
	'onlyUpdateForKeys',
	'onlyUpdateForPropTypes',
	'renameProp',
	'renameProps',
	'setStatic',
	'shouldUpdate',
	'withProps',
	'connect',
	'withReducer',
	'withState',
	'withPropsOnChange',
	'withContext',
	'withHandlers',
]

export const compose = recompose.compose

export const renderNothing = recompose.renderNothing

export default function make ( args ) {

	return function ( Component ) {

		if ( !Component && typeof Component !== 'function' ) return console.warn('Please provide a Component to enhance')

		const enhancements = reduce(recomposeMethods, ( last, current ) => {

			// remap bad keys
			if ( current === 'propsTypes' ) current = 'setPropTypes'

			if ( args.hasOwnProperty(current) ) {

				if ( current === 'withState' || current === 'withReducer' ) {
					forEach(args[ current ], state => {
						last.push(recompose[ current ](...state))
					})
				} else if ( current === 'connect' ) {

					args[ current ] === true
						? last.push(connect())
						: last.push(connect(...[].concat(args[ current ])))

				} else {
					last.push(recompose[ current ](args[ current ]))
				}
			}

			return last
		}, [])

		if ( !args.impure && args.impure !== true ) enhancements.push(recompose.pure)

		return compose(...enhancements)((Component))
	}
}
