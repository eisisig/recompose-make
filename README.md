# recompose-make

### example

```javascript
import React, { PropTypes } from 'react'
import make from 'recompose-make'

export const displayName = 'Button'

export const propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['submit', 'button', 'clear'])
}

export const defaultProps = {
  label: '',
  type: 'button'
}

export const render = ({ label, type }) => {
  return <button type={ type }>{ label }<button>
}
  
export default make({ displayName, propTypes, defaultProps, render })
```



### Note

This is now only used as POC in internal projects so this might not be used at all or changed a lot