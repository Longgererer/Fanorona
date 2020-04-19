import React from 'react'
import cssObj from './options.scss'
import { Button } from 'antd'

class Options extends React.Component {
  constructor(props) {
    super(props)
  }
  render () {
    const { startGame, started, gameOver, nextTurn, combo } = this.props
    return (
      <div className={cssObj.Options}>
        {started && <Button type="danger" onClick={() => gameOver()}>Give up</Button>}
        {combo && <Button type="danger" onClick={nextTurn}>Next turn</Button>}
        {!started && <Button type="primary" onClick={startGame} disabled={started}>Start!</Button>}
        {started && <Button type="primary">Restart</Button>}
        <Button type="dashed">Help</Button>
      </div>
    )
  }
}

export default Options