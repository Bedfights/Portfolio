const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreValue = document.getElementById('scoreValue')
const startGameBtn = document.getElementById('start-game')
const restartThing = document.getElementById('restartThing')
const endScore = document.getElementById('end-score')
const pauseThing = document.getElementById('pauseThing')
const resumeBtn = document.getElementById('resumeGame')

// Settings
const settingsBtn = document.getElementById('settings')
const settingsThing = document.getElementById('settingsThing')
const backToPauseBtn = document.getElementById('backToPause')
const bgVolumeSlider = document.getElementById('bgVolumeSlider')

// Sounds
const backgroundMusic = document.getElementById('background-music')
const shotSound = document.getElementById('shot-sound')
const damageSound = document.getElementById('damage-sound')
const killSound = document.getElementById('kill-sound')
const deathSound = document.getElementById('death-sound')
backgroundMusic.volume = bgVolumeSlider.value
shotSound.volume = 0.1
damageSound.volume = 0.3
killSound.volume = 0.2
deathSound.volume = 0.8

canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {

        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {

        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

const friction = 0.985
class Particle {
    constructor(x, y, radius, color, velocity) {

        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
let projectiles = []
let enemies = []
let particles = []
let isGamePaused = false

function init() {
    player = new Player(x, y, 10, 'white');
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreValue.innerHTML = score
}

let spawnIntervalId
function spawnEnemies() {
    clearInterval(spawnIntervalId)
    spawnIntervalId = setInterval(() => {
        if (!isGamePaused) {
            // radius
            const radius = Math.random() * (30 - 10) + 10

            // spawning
            let x
            let y
        
            if (Math.random() < 0.5) {
                x = Math.random() < 0.5 ? - radius : 
                    canvas.width + radius
                y = Math.random() * canvas.height
            } else {
                x = Math.random() * canvas.width
                y = Math.random() < 0.5 ? - radius : 
                canvas.height + radius
            }
        
            // color
            const color = `hsl(${Math.random() * 360}, 50%, 50%`

            // get enemies moving towards the player
            const angle = Math.atan2(
                canvas.height / 2 - y, 
                canvas.width / 2 - x
            )
            const velocity = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            }

            enemies.push(new Enemy(x, y, radius, color, velocity))

            console.log(enemies)
        }
    }, 1000) 
}

let animationId
let score = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
        particle.update()
        }
    })


    projectiles.forEach((projectile, index) => {
        projectile.update()
        
        // Remove distant projectiles
        if (projectile.x + projectile.radius < 0 || 
            projectile.x - projectiles.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()

        const dist = Math.hypot(
        player.x - enemy.x, player.y - enemy.y)

        // lose (end game)
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            restartThing.style.display = 'flex';
            endScore.innerHTML = score;
            backgroundMusic.pause()
            backgroundMusic.currentTime = 0
            deathSound.currentTime = 0.5
            deathSound.play()
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(
                projectile.x - enemy.x, projectile.y - enemy.y)

                // When projectiles touch enemy
                if (dist - enemy.radius - projectile.radius < 1) {

                    // create explosions
                    for (let i = 0; i < enemy.radius * 2; i++) {
                        particles.push(
                            new Particle(projectile.x, projectile.y, Math.random() * 2, 
                            enemy.color, {
                            x: (Math.random() - 0.5) * 3, 
                            y: (Math.random() - 0.5) * 3
                        }))
                    }

                    if (enemy.radius - 10 > 10) {
                        // incease score
                        score++
                        scoreValue.innerHTML = score
                        
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        })
                        setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                    } else {
                        // incease score
                        score += 2
                        scoreValue.innerHTML = score

                        setTimeout(() => {
                            enemies.splice(index, 1)
                            projectiles.splice(projectileIndex, 1)
                    }, 0)
                    killSound.currentTime = 0.4
                    killSound.play()
                    }
                    damageSound.currentTime = 0.7
                    damageSound.play()
                }
        })
    })
}

function pauseGame() {
    pauseThing.style.display = 'flex'
    cancelAnimationFrame(animationId)
    isGamePaused = true
    backgroundMusic.pause()
}

function resumeGame() {
    pauseThing.style.display = 'none'
    animate()
    isGamePaused = false
    backgroundMusic.play()
}

function settings() {
    pauseThing.style.display = 'none'
    settingsThing.style.display = 'flex'
}

function backToPause() {
    pauseThing.style.display = 'flex'
    settingsThing.style.display = 'none'
}

bgVolumeSlider.addEventListener('input', function () {
    backgroundMusic.volume = this.value
})

addEventListener('click', (event) => {
    if (!isGamePaused) {
        const angle = Math.atan2(
            event.clientY - canvas.height / 2, 
            event.clientX - canvas.width / 2
        )
        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        }
        projectiles.push(new Projectile(
            canvas.width / 2,
            canvas.height / 2,
            5,
            'white',
            velocity
        ))
        shotSound.currentTime = 0
        shotSound.play()
    }
})

startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    restartThing.style.display = 'none'
    backgroundMusic.play()
})

addEventListener('keydown', (event) => {
    if (event.key === "Escape" || event.key === "Esc") {
        pauseGame()
    }
})

resumeBtn.addEventListener('click', () => {
    resumeGame()
})

settingsBtn.addEventListener('click', () => {
    settings()
})

backToPauseBtn.addEventListener('click', () => {
    backToPause()
})
