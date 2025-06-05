document.addEventListener("DOMContentLoaded", function () {
    const player = document.getElementById("player");
    const cheese = document.getElementById("cheese");
    const walls = document.querySelectorAll(".wall");


    function setInitialPlayerPosition() {
        const initialX = 600;
        const initialY = 80;


        player.style.left = initialX + "px";
        player.style.top = initialY + "px";
    }


    setInitialPlayerPosition();


    document.addEventListener("keydown", function (event) {
        handlePlayerMovement(event.key, walls);
    });


    function handlePlayerMovement(key, walls) {
                if (!player || !cheese) {
            console.error("Player or cheese element not found.");
            return;
        }
        const playerRect = player.getBoundingClientRect();
        const cheeseRect = cheese.getBoundingClientRect();
        let newX = playerRect.left;
        let newY = playerRect.top;


        const step = 20;


        switch (key) {
            case "w":
                newY = Math.max(0, newY - step);
                break;
            case "a":
                newX = Math.max(0, newX - step);
                break;
            case "s":
                newY = Math.min(window.innerHeight - playerRect.height, newY + step);
                break;
            case "d":
                newX = Math.min(window.innerWidth - playerRect.width, newX + step);
                break;
        }


        // Check for collisions with walls
        if (!checkCollision(newX, newY, playerRect.width, playerRect.height, walls)) {
            player.style.left = newX + "px";
            player.style.top = newY + "px";
            // Check for Collisions with Cheese (WIN)
            if (checkWin(playerRect, cheeseRect)) {
                displayWinMessage();
            }
        }
    }


    function checkCollision(x, y, width, height, walls) {
        for (const wall of walls) {
            const wallRect = wall.getBoundingClientRect();
            if (
                x < wallRect.right &&
                x + width > wallRect.left &&
                y < wallRect.bottom &&
                y + height > wallRect.top
            ) {
                // Collision detected
                console.log("Collision detected with wall:", wall);
                return true;
            }
        }
        // No collision
        console.log("No collision detected");
        return false;
    }


function checkWin(playerRect, cheeseRect) {
    return (
        playerRect.right >= cheeseRect.left &&
        playerRect.left <= cheeseRect.right &&
        playerRect.bottom >= cheeseRect.top &&
        playerRect.top <= cheeseRect.bottom
    );
}
function displayWinMessage() {
    alert("You won!");
}

});


