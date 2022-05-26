/* Dependencies */
import {useState, useEffect, useRef} from 'react'
import Helpers from '../Helpers'
import {connect} from 'react-redux'
import {gsap} from "gsap";

/* Components */
import Modal from './Modal'
import Nav from './Nav'

/* Actions */
import {storePayload} from '../actions/storePayload'

/* Styles */
import '../styles/App.css'

/* App handles:
    -player rendering
    -collision detection
    -math problem generation
    -wall rendering and animations
    -play again functionality
*/
function App(props) {
  const playerRef = useRef()
  const [playerStyle, setPlayerStyle] = useState({
    height: 50,
    width: 50,
  })
  const [playerPhysics, _setPlayerPhysics] = useState({
    x: 0,
    y: 0,
    left: false,
    right: false,
  })
  const [playerLane, _setPlayerLane] = useState(0)
  const playerPhysicsRef = useRef(playerPhysics)
  const gameplayContainerRef = useRef()
  const mathProblemRef = useRef(props.mathProblem)
  const playerStatsRef = useRef(props.playerStats)
  const playerLaneRef = useRef(0)
  const wallRef = useRef()
  const gameOverModalRef = useRef()
  let tl /* gsap timeline */
  const tlRef = useRef()

  useEffect(() => {
    if (!tl) { /* To only trigger once */
      startGame()
    }
  }, [])

  useEffect(() => {
    if (playerStatsRef.current.right === playerStatsRef.current.nextLevel) {
      tlRef.current.timeScale(1 + (playerStatsRef.current.currentLevel * props.defaultGame.speedScaling))
      setPlayerStats({
        ...playerStatsRef.current,
        currentLevel: playerStatsRef.current.currentLevel + 1,
        nextLevel: playerStatsRef.current.nextLevel * props.defaultGame.levelScaling
      })
    }
  }, [props.playerStats])

  function startGame() {
    /* Reset player stats */
    setPlayerStats({
      right: 0,
      wrong: 0,
      currentLevel: props.defaultGame.currentLevel,
      nextLevel: props.defaultGame.nextLevel
    })

    /* Reattach key listeners */
    document.addEventListener('keypress', onKeyPress)
    document.addEventListener('keyup', onKeyUp)

    /* Move wall */
    tl = gsap.timeline({repeat: -1});

    /* Scale wall animation to current level */
    tl.timeScale(1 + ((playerStatsRef.current.currentLevel - 1) * props.defaultGame.speedScaling))

    /* part2Time is the time it takes the wall to go from top of player
       to bottom of gameplay container

       part1Time is the time it takes the wall to go from the top of
       gameplay container to top of player
    */

    const part2Time =
      (playerStyle.height + 96) /
      (gameplayContainerRef.current.offsetHeight / props.defaultGame.wallSpeed)
    const part1Time = props.defaultGame.wallSpeed - part2Time
  
    /* Return to top after game over */
    tl.to(
      wallRef.current,
      {
        duration: 0,
        y: 96,
      }
    )
    /* Move to top of player */
    tl.to(
      wallRef.current,
      {
        duration: part1Time / 1000,
        y: `${gameplayContainerRef.current.offsetHeight - playerStyle.height}px`,
        ease: 'none',
        onComplete: () => {
          const isPlayerCorrect = isRightAnswer()
          if (isPlayerCorrect) {
            setPlayerStats({
              ...playerStatsRef.current,
              right: playerStatsRef.current.right + 1
            })
            gsap.to(document.getElementById(`door-${playerLaneRef.current}`), {borderColor: 'black', duration: 0.3})
          } else {
            setPlayerStats({
              ...playerStatsRef.current,
              wrong: playerStatsRef.current.wrong + 1
            })
            tl.pause()
            document.removeEventListener('keypress', onKeyPress)
            document.removeEventListener('keyup', onKeyUp)
            gsap.to(gameOverModalRef.current, {y: gameplayContainerRef.current.offsetHeight / 2 - 56, ease: "elastic", duration: 1.5})
          }
        }
      },
    )
    /* Move to bottom of gameplay container */
    tl.to(
      wallRef.current,
      {
        duration: part2Time / 1000,
        y: `${gameplayContainerRef.current.offsetHeight + 96}px`,
        ease: 'none',
        onComplete: () => {
          createMathProblem()
          gsap.to(document.getElementById(`door-${playerLaneRef.current}`), {borderColor: 'white', duration: 0.1})
        }
      }
    )
    tlRef.current = tl
  }

  useEffect(() => {
    movePlayer()
  }, [])

  function movePlayer() {
    const isNotAtRightLimit =
      playerPhysicsRef.current.x < gameplayContainerRef.current.offsetWidth - playerStyle.width
    const isNotAtLeftLimit = playerPhysicsRef.current.x > 0
    if (playerPhysicsRef.current.right && isNotAtRightLimit) {
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        x: playerPhysicsRef.current.x + props.defaultGame.playerSpeed
      })
    } else if (playerPhysicsRef.current.left && isNotAtLeftLimit) {
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        x: playerPhysicsRef.current.x - props.defaultGame.playerSpeed
      })
    }
    setTimeout(() => {
      window.requestAnimationFrame(movePlayer)
    }, props.defaultGame.frameRate)
  }

  /* handle state references
  -----------------------------------*/
  const setPlayerPhysics = (data) => {
    playerPhysicsRef.current = data
    _setPlayerPhysics(data)
  }

  const setMathProblem = (data) => {
    mathProblemRef.current = data
    props.storePayload({
      mathProblem: data,
    })
  }

  const setPlayerStats = (data) => {
    playerStatsRef.current = data
    props.storePayload({
      playerStats: data,
    })
  }

  const setPlayerLane = (data) => {
    playerLaneRef.current = data
    _setPlayerLane(data)
  }
  /*-----------------------------------*/

  function onKeyPress(e) {
    if (e.key === 'a') { // left
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        left: true,
        right: false,
      })
    } else if (e.key === 'd') { // right
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        left: false,
        right: true,
      })
    }
  }

  function onKeyUp(e) {
    if (e.key === 'a') { // left
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        left: false,
      })
    } else if (e.key === 'd') { // right
      setPlayerPhysics({
        ...playerPhysicsRef.current,
        right: false,
      })
    }
  }

  function createMathProblem() {
    const {randomIntFromInterval, shuffle} = Helpers
    const min = 0
    const max = 9
    const operators = ['+', '-']
    const firstNum = randomIntFromInterval(min, max)
    const secondNum = randomIntFromInterval(min, max)
    let answer
    const operatorIndex = randomIntFromInterval(0, operators.length - 1)
    if (operatorIndex === 1) {
      answer = firstNum - secondNum
    } else {
      answer = firstNum + secondNum
    }
    const choices = shuffle([
      answer,
      randomIntFromInterval(min, max),
      randomIntFromInterval(min, max),
      randomIntFromInterval(min, max)
    ])
    const problemString = `${firstNum} ${operators[operatorIndex]} ${secondNum} = ?`
    setMathProblem({
      problemString,
      answer,
      choices,
    })
  }

  function isRightAnswer() {
    const playerLane = getPlayerLane()
    /* TO DO: move this functionality or rename function */
    setPlayerLane(playerLane)
    const playerLaneElement = document.getElementById(`door-${playerLane}`)
    const playerAnswer = playerLaneElement.innerHTML
    if (playerAnswer == mathProblemRef.current.answer) {
      // console.log('correct')
      return true
    } else {
      // console.log('incorrect')
      return false
    }
  }

  function getPlayerLane() {
    const gameplayContainerWidth = gameplayContainerRef.current.offsetWidth
    const laneWidth = gameplayContainerWidth / 4
    if (playerPhysicsRef.current.x < laneWidth) {
      return 0
    } else if (playerPhysicsRef.current.x < laneWidth * 2) {
      return 1
    } else if (playerPhysicsRef.current.x < laneWidth * 3) {
      return 2
    } else {
      return 3
    }
  }

  function onClickPlayAgain() {
    /* exit modal */
    gsap.to(gameOverModalRef.current, {y: '-110%', duration: 0.3})
    createMathProblem()
    startGame()
  }

  return (
    <div className="App">
      {/* <div className='overlay' /> */}
      <Modal
        onClickPlayAgain={onClickPlayAgain}
        gameOverModalRef={gameOverModalRef}
      />
      <Nav />
      <div className="gameplay-container" ref={gameplayContainerRef}>
        <div
          className="wall"
          ref={wallRef}
        >
          {props.mathProblem.choices.map((choice, i) => {
            return (
              <div key={`door-${i}`} id={`door-${i}`} className="door">
                {choice}
              </div>
            )
          })}
        </div>
        <div
          style={{
            transform: `translate(${playerPhysics.x}px, 0)`,
            width: `${playerStyle.width}px`,
            height: `${playerStyle.height}px`,
            // width: 0,
            // height: 0,
            // border: `${playerStyle.height / 2}px solid transparent`,
            // borderTop: 0,
            // borderBottom: `${playerStyle.height}px solid ${playerStyle.color}`,
          }}
          className="player"
          ref={playerRef}
        />
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  defaultGame: state.userReducer.defaultGame,
  playerStats: state.userReducer.playerStats,
  playerStyle: state.userReducer.playerStyle,
  playerPhysics: state.userReducer.playerPhysics,
  mathProblem: state.userReducer.mathProblem,
})

export default connect(
    mapStateToProps,
    {storePayload},
)(App)
