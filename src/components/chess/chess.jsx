import React from 'react'
import cssObj from './chess.scss'

const publicUrl = process.env.PUBLIC_URL

class Chess extends React.Component {
  constructor() {
    super()
    this.state = {
      isHover: false
    }
  }
  printInfo = () => {
    const props = this.props
    const chess = props.chessInfo
    if (chess.passable) props.moveChess(chess)
    if (chess.usable) props.updateActiveChess(chess)
    if (chess.removable) props.cleanRemovableChess(chess)
  }
  mouseEnter = () => {
    this.setState({ isHover: true })
  }
  mouseLeave = () => {
    this.setState({ isHover: false })
  }
  render () {
    // 判断是黑棋还是白棋
    const chess = this.props.chessInfo
    const isHover = this.state.isHover
    const chessUrl = process.env.PUBLIC_URL + (chess.player === 'black' ? '/black.svg' : '/white.svg')
    const usableStyle = !chess.usable ? '' : isHover ? cssObj.usableActive : cssObj.usable
    const activeStyle = chess.isActive ? cssObj.clickActive : ''
    const removeStyle = chess.removable ? cssObj.removable : ''
    return (
      <div className={`${cssObj.chessBox} flex flex-1 flex-ai flex-jcc`}
        onClick={this.printInfo}
        onMouseEnter={this.mouseEnter}
        onMouseLeave={this.mouseLeave}>
        {
          chess.player !== 'none' && <img className={`${usableStyle} ${activeStyle} ${removeStyle}`} src={chessUrl} alt="" />
        }
        {
          (chess.passable && this.state.isHover) && <div className={cssObj.passable}></div>
        }
        {
          chess.isForbid && <img src={`${publicUrl}/forbid.svg`} alt="" />
        }
      </div>
    )
  }
}

export default Chess