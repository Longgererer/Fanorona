import React from 'react'
import cssObj from './chessboard.scss'
import Chess from '../chess/chess'
import Options from '../options/options'
const publicUrl = process.env.PUBLIC_URL

class Chessboard extends React.Component {
  constructor() {
    super()
    this.state = {
      // 棋盘棋子信息
      chessInfo: [],
      whoseTurn: 'white',
      usableList: [],
      blackNum: 0,
      whiteNum: 0,
      activeChess: {},
      frontList: [],
      afterList: [],
      forbidList: [],
      combo: false,
      eatable: true,
      started: false
    }
  }
  updateTurn () {
    // 下一回合
    let { whoseTurn, chessInfo } = this.state
    whoseTurn = whoseTurn === 'black' ? 'white' : 'black'
    for (let y = 0;y < 5;y++) {
      for (let x = 0;x < 9;x++) {
        const pos = chessInfo[y][x]
        pos.passable && (pos.passable = false)
      }
    }
    this.setState({
      whoseTurn,
      chessInfo,
      combo: false,
      eatable: true,
      activeChess: []
    }, () => {
      this.handleForbid()
      this.judgeUsableChess()
    })
  }
  startGame = (ee) => {
    // 开始游戏
    this.setState({
      chessInfo: this.initChessInfo(),
      whoseTurn: 'white',
      started: true,
      combo: false,
      eatable: true,
      blackNum: 22,
      whiteNum: 22,
      activeChess: {},
      forbidList: [],
      usableList: []
    }, () => {
      this.judgeUsableChess()
    })
  }
  gameOver = winner => {
    console.log(winner)
    const whoseTurn = winner ? winner : (this.state.whoseTurn === 'black' ? 'white' : 'black')
    console.log(whoseTurn)
    // 游戏结束
    this.setState({
      chessInfo: [],
      blackNum: 0,
      whiteNum: 0,
      started: false,
      activeChess: {},
      eatable: true,
      forbidList: [],
      usableList: [],
      combo: false
    }, () => {
      alert(`${whoseTurn} win!!!`)
    })
  }
  nextTurn = () => {
    // 下一回合
    const { usableList, activeChess, chessInfo } = this.state
    if (Object.keys(activeChess).length) {
      const { x, y } = activeChess
      chessInfo[y][x].usable = false
      chessInfo[y][x].isActive = false
    }
    usableList.forEach(item => {
      item.usable = false
    })
    this.setState({
      combo: false,
      eatable: true
    })
    this.updateTurn()
  }
  updateChessNum () {
    // 更新对方棋子数，在吃掉对手棋子时更新
    const state = this.state
    const whoseTurn = state.whoseTurn === 'black' ? 'white' : 'black'
    const chessInfo = state.chessInfo
    let num = 0
    for (let y = 0;y < 5;y++) {
      for (let x = 0;x < 9;x++) {
        if (chessInfo[y][x].player === whoseTurn) num++
      }
    }
    if (!num) {
      this.gameOver(state.whoseTurn)
      return void 0
    }
    const key = whoseTurn === 'black' ? 'blackNum' : 'whiteNum'
    this.setState({ [key]: num })
  }
  updateActiveChess = info => {
    // 更新当前被点击的棋子
    const { chessInfo, activeChess } = this.state
    if (info.usable) {
      if (Object.keys(activeChess).length) {
        const x = activeChess.x
        const y = activeChess.y
        chessInfo[y][x].isActive = false
      }
      const x = info.x
      const y = info.y
      chessInfo[y][x].isActive = true
      this.setState({
        chessInfo,
        activeChess: { x, y }
      }, () => {
        // 更新完点击棋子之后，需要获取该棋子可走路径
        this.getPassablePos(info)
      })
    }
  }
  getPassablePos (info) {
    // 获取当前点击棋子可走路径
    // 获取所有空位，判断可移动棋子能否到达该空位
    // 如果当前棋子的横坐标加上纵坐标为单数，则无法斜向行走
    // 棋子无法在相同方向上连续走两步，无论是正向还是逆向
    // 如果棋子移至当前空位不能消除棋子，或者该位置已经走过，返回
    const { chessInfo, forbidList, eatable } = this.state
    const blankList = []
    for (let y = 0;y < 5;y++) {
      for (let x = 0;x < 9;x++) {
        const pos = chessInfo[y][x]
        pos.player === 'none' && blankList.push(pos)
      }
    }
    const x = info.x
    const y = info.y
    for (let i = 0, k = blankList.length;i < k;i++) {
      const blank = blankList[i]
      if (blank.isForbid) continue
      const bX = blank.x
      const bY = blank.y
      if (forbidList.length) {
        const lastForbid = forbidList[forbidList.length - 1]
        if ((lastForbid.x + bX) / 2 === x && (lastForbid.y + bY) / 2 === y) continue
      }
      blank.passable = false // 先初始化为false
      if ((x + y) % 2 === 0) {
        if (bX === x + 1 || bX === x - 1) {
          if (bY === y + 1 || bY === y - 1) {
            const isEatable = this.moveChess(blank, false, info) || !eatable
            isEatable && (blank.passable = true)
          }
        }
      }
      if (bX === x && (bY === y - 1 || bY === y + 1)) {
        const isEatable = this.moveChess(blank, false, info) || !eatable
        isEatable && (blank.passable = true)
      }
      if (bY === y && (bX === x - 1 || bX === x + 1)) {
        const isEatable = this.moveChess(blank, false, info) || !eatable
        isEatable && (blank.passable = true)
      }
    }
  }
  moveChess = (info, move = true, textChess) => {
    // move参数表示是否移动棋子，如果为false，只检验棋子是否可以吃子，返回布尔值
    // 当move为false时需要传入textChess测试棋子替代activeChess
    const { chessInfo, whoseTurn, activeChess } = this.state
    const { x, y } = info
    const { x: actX, y: actY } = move ? activeChess : textChess
    const differX = x - actX
    const differY = y - actY
    const actChess = chessInfo[actY][actX]
    // 将玩家当前使用的棋子移动到被点击的空位
    // 吃子后计算对方玩家棋子数量
    // 将所有可用棋子状态重置
    if (move) {
      info.passable = false
      info.player = whoseTurn
      actChess.player = 'none'
      actChess.isActive = false
      for (let y = 0;y < 5;y++) {
        for (let x = 0;x < 9;x++) {
          const chess = chessInfo[y][x]
          chess.player === whoseTurn && chess.usable && (chess.usable = false)
        }
      }
      this.setState({ chessInfo })
    }
    // 检测棋子移动方向或相反方向上有无对方玩家棋子，如果有，清除对方玩家棋子
    // 对手
    const opponent = whoseTurn === 'black' ? 'white' : 'black'
    // 前后棋子坐标
    const frontX = x + differX
    const frontY = y + differY
    const afterX = actX - differX
    const afterY = actY - differY
    // 前后棋子是否存在，存在棋子时，判断棋子是否为对方棋子
    let haveFront = false
    let haveAfter = false
    this.judgeChessSave(frontX, frontY)
      && chessInfo[frontY][frontX].player === opponent
      && (haveFront = true)
    this.judgeChessSave(afterX, afterY)
      && chessInfo[afterY][afterX].player === opponent
      && (haveAfter = true)
    // 如果不是真正的对棋子进行移动，只是检测是否有可吃棋子，返回
    if (!move) return haveFront || haveAfter
    // 获取前后对方棋子列表
    let frontList = []
    let afterList = []
    if (haveFront) {
      frontList = this.getRemovableChess(
        opponent,
        'front',
        { x: differX, y: differY },
        { x, y }
      )
    }
    if (haveAfter) {
      afterList = this.getRemovableChess(
        opponent,
        'after',
        { x: differX, y: differY },
        { x: actX, y: actY }
      )
    }
    /**
     * 如果只有一个方向有对方棋子，那么直接去掉对方棋子
     * 如果两个方向都有，需要先等待玩家选择吃子方向
     * 如果都没有，直接到下一回合
     */
    if (haveFront && haveAfter) {
      const removeList = [...frontList, ...afterList]
      removeList.forEach(item => {
        item.removable = true
      })
      this.setState({
        frontList,
        afterList
      })
    } else if (!haveFront && !haveAfter) {
      this.updateTurn()
      return void 0
    } else {
      const removeList = [...frontList, ...afterList]
      removeList.forEach(item => {
        item.player = 'none'
      })
      this.updateChessNum()
      // 判断移动后的棋子是否还可以继续移动吃子
      const isCombo = this.judgeCombo(info, actChess)
      if (isCombo) {
        // 可以连击时，将该棋子置为可用
        info.usable = true
        this.handleForbid(actChess)
      } else {
        this.handleForbid(actChess)
        this.updateTurn()
      }
    }
  }
  judgeCombo (chess, forbidChess) {
    /**
     * 判断该棋子是否可以连击
     * 当棋子走完一步后触发
     * 判断棋子周围是否有其他空位，不包含禁止通行的空位
     * 棋子移动至空位是否可以吃子
     */
    const chessInfo = this.state.chessInfo
    const { x: currentX, y: currentY } = chess
    const roundPos = [] // 存放棋子周围8个位置的坐标
    for (let y = -1;y < 2;y++) {
      for (let x = -1;x < 2;x++) {
        if ((currentX + currentY) % 2 === 1) {
          if (y !== x) {
            roundPos.push({
              x: x + currentX, y: y + currentY
            })
          }
        } else {
          if (y || x) {
            roundPos.push({
              x: x + currentX, y: y + currentY
            })
          }
        }
      }
    }
    for (let i = roundPos.length - 1;i >= 0;i--) {
      const { x, y } = roundPos[i]
      const isSaved = this.judgeChessSave(x, y)
      if (!isSaved) {
        roundPos.splice(i, 1)
      } else {
        const afterX = forbidChess.x
        const afterY = forbidChess.y
        const frontX = currentX * 2 - afterX
        const frontY = currentY * 2 - afterY
        const currentChess = chessInfo[y][x]
        // 消除非空坐标，以及同方向前后两个空坐标
        if (currentChess.player !== 'none') {
          roundPos.splice(i, 1)
        } else if (currentChess.isForbid) {
          roundPos.splice(i, 1)
        } else if (x === afterX && y === afterY) {
          roundPos.splice(i, 1)
        } else if (x === frontX && y === frontY) {
          roundPos.splice(i, 1)
        }
      }
    }
    if (!roundPos.length) return false
    for (let i = 0, k = roundPos.length;i < k;i++) {
      // 判断是否可吃子
      const item = roundPos[i]
      const blank = chessInfo[item.y][item.x]
      const eatable = this.moveChess(blank, false, chess)
      if (eatable) {
        this.setState({
          combo: true
        })
        return true
      }
    }
    return false
  }
  handleForbid (forbidChess) {
    // 处理禁止通行的坐标列表
    // 如果没有传入forbidChess表示清除所有禁止棋子
    const forbidList = this.state.forbidList
    if (forbidChess) {
      forbidChess.isForbid = true
      this.setState({
        forbidList: [
          ...forbidList,
          forbidChess
        ]
      })
    } else {
      forbidList.forEach(item => {
        item.isForbid = false
        item.usable = false
      })
      this.setState({
        forbidList: []
      })
    }
  }
  getRemovableChess (opponent, direction, differ, position) {
    const chessInfo = this.state.chessInfo
    // 获取可移除的棋子坐标
    // 判断对应方向上的对方棋子数量并返回坐标列表
    let { x: differX, y: differY } = differ
    if (direction !== 'front') {
      differX = -differX
      differY = -differY
    }
    const borderX = differX < 0 ? 0 : differX === 0 ? 100 : 8
    const borderY = differY < 0 ? 0 : differY === 0 ? 100 : 4
    let { x: posX, y: posY } = position
    const numX = Math.abs(borderX - posX)
    const numY = Math.abs(borderY - posY)
    const cycleIndex = numX < numY ? numX : numY
    const removeList = []
    for (let i = 0;i < cycleIndex;i++) {
      posX = posX + differX
      posY = posY + differY
      const chess = chessInfo[posY][posX]
      if (chess.player === opponent) removeList.push(chess)
      else break
    }
    return removeList
  }
  cleanRemovableChess = info => {
    const { frontList, afterList } = this.state
    if (frontList.indexOf(info) >= 0) {
      frontList.forEach(item => {
        item.player = 'none'
      })
      afterList.forEach(item => {
        item.removable = false
      })
    }
    if (afterList.indexOf(info) >= 0) {
      afterList.forEach(item => {
        item.player = 'none'
      })
      frontList.forEach(item => {
        item.removable = false
      })
    }
    this.updateChessNum()
    this.updateTurn()
  }
  judgeChessSave (x, y) {
    if (x >= 0 && x <= 8) {
      if (y >= 0 && y <= 4) {
        return true
      }
    }
    return false
  }
  initChessInfo () {
    const chessInfo = []
    for (let y = 0;y < 5;y++) {
      const infoList = []
      for (let x = 0;x < 9;x++) {
        // 根据坐标初始化棋子信息
        const info = {
          id: `${x}${y}`, // id区分唯一性
          x, // 横坐标
          y, // 纵坐标
          player: 'white', // 棋子所属玩家
          usable: false, // 棋子是否可移动
          isForbid: null, // 是否禁止移动至该位置
          passable: false, // 是否可以通过该位置
          isActive: false, // 该棋子是否被点击
          removable: false // 该棋子是否可移除(在正反方向都有可吃棋子时显示)
        }
        // 初始化黑白棋
        if (y <= 1) {
          info.player = 'black'
        }
        const blackPos = [0, 2, 5, 7]
        if (y === 2 && blackPos.indexOf(x) !== -1) {
          info.player = 'black'
        }
        // 中间空位
        if (y === 2 && x === 4) {
          info.player = 'none'
        }
        infoList.push(info)
      }
      chessInfo.push(infoList)
    }
    return chessInfo
  }
  judgeEatableChess (list, blank) {
    // 找出所有可以吃子的棋子
    const whoseTurn = this.state.whoseTurn
    const eatableList = []
    list.forEach(item => {
      if (item.player === whoseTurn) {
        const eatable = this.moveChess(blank, false, item)
        eatable && eatableList.push(item)
      }
    })
    return eatableList
  }
  judgeUsableChess = () => {
    // 判断哪些棋子可用，只找出可以吃子的棋子，如果都不能吃子，就找出所有可以移动的棋子
    const { whoseTurn, chessInfo } = this.state
    const blankList = []
    // 找出所有空着的位置
    for (let y = 0;y < 5;y++) {
      for (let x = 0;x < 9;x++) {
        const info = chessInfo[y][x]
        info.player === 'none' && blankList.push(info)
      }
    }
    // 找出所有空位周围可移动的当前玩家的棋子，获取其坐标
    let usableList = [] // 可以移动的棋子
    let eatableList = [] // 可以移动并吃子的棋子
    for (let i = 0, k = blankList.length;i < k;i++) {
      const blank = blankList[i]
      const preLen = usableList.length // push之前的长度
      const x = blank.x
      const y = blank.y
      // 判断棋子周围的8个空位是否存在
      y && usableList.push(chessInfo[y - 1][x])
      x && usableList.push(chessInfo[y][x - 1])
      y !== 4 && usableList.push(chessInfo[y + 1][x])
      x !== 8 && usableList.push(chessInfo[y][x + 1])
      if ((y + x) % 2 === 0) {
        y && x && usableList.push(chessInfo[y - 1][x - 1])
        y !== 4 && x !== 8 && usableList.push(chessInfo[y + 1][x + 1])
        y && x !== 8 && usableList.push(chessInfo[y - 1][x + 1])
        y !== 4 && x && usableList.push(chessInfo[y + 1][x - 1])
      }
      // 需要取出本次循环插入的可移动的棋子，与空位一起传入judgeEatableChess
      // 判断该棋子是否可以吃子
      const currentEatableList = this.judgeEatableChess(usableList.slice(preLen), blank)
      eatableList = [...eatableList, ...currentEatableList]
    }
    if (eatableList.length) {
      usableList = eatableList
    } else {
      // 如果所有棋子都不能吃子，那么旁边有空位的棋子可以随意移动
      this.setState({
        eatable: false
      })
    }
    let len = usableList.length
    while (len--) {
      usableList[len].player === whoseTurn && (usableList[len].usable = true)
    }
    this.setState({ usableList })
  }
  render () {
    const { started, chessInfo, combo } = this.state
    return (
      <div className="flex flex-ai flex-jcc flex-clo">
        <Options startGame={this.startGame} started={started} combo={combo} gameOver={this.gameOver} nextTurn={this.nextTurn}></Options>
        <div className={`${cssObj.Chessboard} flex flex-ai flex-jcc`}>
          <img className={cssObj.boardImg} src={`${publicUrl}/chessboard.svg`} alt="" />
          <div className={`${cssObj.screenBox} flex flex-clo`}>
            {
              chessInfo.map((list, index) => (
                <div className="flex flex-1" key={index}>
                  {
                    list.map(chess => {
                      return (
                        <Chess
                          chessInfo={chess}
                          key={chess.id}
                          updateActiveChess={this.updateActiveChess}
                          moveChess={this.moveChess}
                          cleanRemovableChess={this.cleanRemovableChess}>
                        </Chess>
                      )
                    })
                  }
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Chessboard