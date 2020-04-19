import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Chessboard from './components/chessboard/chessboard'

import * as serviceWorker from './serviceWorker'

serviceWorker.unregister()
// 模块热替换
if (module.hot) {
  module.hot.accept()
}

const App = (
  <div className="App noselect flex flex-ai flex-jcc flex-clo">
    <Chessboard></Chessboard>
  </div>
)

ReactDOM.render(
  App,
  document.getElementById('root')
)
