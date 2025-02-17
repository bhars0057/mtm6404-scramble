/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle (src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
**********************************************/

const wordsArray = ['elephant', 'giraffe', 'kangaroo', 'hippopotamus', 'crocodile', 'alligator', 'zebra', 'panda', 'tiger', 'hippo']

const ScrambleGame = () => {
  const initialGameState = {
    score: 0,
    strikes: 0,
    currentWordIndex: 0,
    passesRemaining: 3,
    words: wordsArray,
  }

  const [gameState, setGameState] = React.useState(() => {
    const savedState = localStorage.getItem('scrambleGameState')
    return savedState ? JSON.parse(savedState) : initialGameState
  })

  const [scrambledWord, setScrambledWord] = React.useState('')
  const [guess, setGuess] = React.useState('')
  const [feedbackMessage, setFeedbackMessage] = React.useState('')

  const shuffle = (word) => {
    return word.split('').sort(() => Math.random() - 0.5).join('')
  }

  const ScrambleCurrentWord = () => {
    const wordToScramble = gameState.words[gameState.currentWordIndex]
    const scrambled = shuffle(wordToScramble)
    setScrambledWord(scrambled)
  }

  React.useEffect(() => {
    ScrambleCurrentWord()
  }, [gameState.currentWordIndex])

  React.useEffect(() => {
    localStorage.setItem('scrambleGameState', JSON.stringify(gameState))
  }, [gameState])

  const getHighScore = () => {
    const highScore = localStorage.getItem('highestScore')
    return highScore ? parseInt(highScore, 10) : 0
  }

  const highScore = getHighScore()

  const handleGuessSubmit = (e) => {
    e.preventDefault()

    if (guess.trim() === '') {
      setFeedbackMessage('Please enter a guess!')
      return
    }

    if (guess.toLowerCase() === gameState.words[gameState.currentWordIndex].toLowerCase()) {
      if (gameState.currentWordIndex === gameState.words.length - 1) {
        setGameState((prevState) => {
          const finalScore = prevState.score + 1
          localStorage.setItem('highScore', Math.max(finalScore, highScore))
          return { ...initialGameState, score: finalScore }
        })
        setFeedbackMessage(`Correct! You completed all words. Final score: ${gameState.score + 1}`)
        if (confirm('Would you like to play again?')) {
          setGameState(initialGameState)
        }
      } else {
        setGameState((prevState) => ({
          ...prevState,
          score: prevState.score + 1,
          currentWordIndex: prevState.currentWordIndex + 1,
        }))
        setFeedbackMessage('Correct! You get a point.')
        setGuess('')
      }
    } else {
      setGameState((prevState) => {
        const newStrikes = prevState.strikes + 1
        if (newStrikes >= 3) {
          endGame()
        }
        return { ...prevState, strikes: newStrikes }
      })
      setFeedbackMessage('Incorrect! You get a strike.')
      setGuess('')
    }

    if (gameState.strikes >= 2 && gameState.currentWordIndex < gameState.words.length - 1) {
      endGame()
    }
  }

  const handlePass = () => {
    if (gameState.passesRemaining > 0) {
      if (gameState.currentWordIndex === gameState.words.length - 1) {
        endGame()
      } else {
        setFeedbackMessage('Skipped word!')
        setGameState((prevState) => ({
          ...prevState,
          passesRemaining: prevState.passesRemaining - 1,
          currentWordIndex: prevState.currentWordIndex + 1,
        }))
      }
    } else {
      setFeedbackMessage('No passes remaining!')
    }
  }

  const endGame = () => {
    const finalScore = gameState.score
    const maxScore = Math.max(finalScore, highScore)
    localStorage.setItem('highestScore', maxScore)

    setFeedbackMessage(`Game Over! You scored ${finalScore} points. High score: ${maxScore}.`)
    if (confirm('Would you like to start a new game?')) {
      setGameState(initialGameState)
      setGuess('')
    }
  }

  return (
    <div>
      <h1>Scramble Game</h1>
      <h3>High Score: {highScore}</h3>
      <h3>Current Score: {gameState.score}</h3>
      <h3>Current Strikes: {gameState.strikes}</h3>
      <h3>Passes Remaining: {gameState.passesRemaining}</h3>
      <h2>Scrambled Word: {scrambledWord}</h2>

      <form onSubmit={handleGuessSubmit}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Your guess"
        />
        <button className="btn" type="submit">Submit Guess</button>
      </form>
      <div className="btnGroup">
        <button className="btn" onClick={handlePass}>Pass</button>
        <button className="btn" onClick={endGame}>Restart Game</button>
      </div>
      {feedbackMessage && <div className="feedbackMessage">{feedbackMessage}</div>}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<ScrambleGame />)