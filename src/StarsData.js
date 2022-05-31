import Helpers from './Helpers.js'

const starsData = 
  Array.apply(null, Array(30)).map(() => {
    return (
      {
        size: Helpers.randomIntFromInterval(1, 6),
        co: [Math.random(), Math.random()],
      }
    )
  })

export default starsData