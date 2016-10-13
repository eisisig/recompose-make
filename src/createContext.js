import has from 'lodash/fp/has'
import reduce from 'lodash/fp/reduce'
import toPairs from 'lodash/fp/toPairs'
import compose from 'lodash/fp/compose'
import { withContext } from 'recompose'

/**
 * create a context method from a simple object
 *
 * NOTE: This is probably not very wise to use. But the strict
 * contract between context makes too much extra boilerplate
 * for simple usages
 *
 * @param {Object} obj      propTypes object description
 * @returns {Function}      withContext recompose method
 */
export default function createContext ( obj ) {

	const createProps = reduce(( last, [key, val] ) => {
		if ( has(key)(obj) ) last[ key ] = val
		return last
	}, {})

	return withContext(obj, compose(createProps, toPairs))
}
