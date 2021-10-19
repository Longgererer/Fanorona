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
        {!started && <Button type="primary" onClick={startGame}>Start!</Button>}
        {started && <Button type="primary" onClick={startGame}>Restart</Button>}
        <Button type="dashed"><a href="https://github.com/Longgererer/Fanorona#%E6%B8%B8%E6%88%8F%E8%A7%84%E5%88%99" target="black">Help</a></Button>
      </div>
    )
  }
}

export default Options