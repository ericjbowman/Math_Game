import Helpers from './Helpers.js'

const starData = 
  Array.apply(null, Array(40)).map(() => {
    return (
      {
        size: Helpers.randomIntFromInterval(1, 8),
        co: [Math.random(), Math.random()],
      }
    )
  })

export default starData