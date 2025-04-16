document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const zoneAInputs = document.querySelector('#zone-a .team-inputs');
    const zoneBInputs = document.querySelector('#zone-b .team-inputs');
    const calculateBtn = document.getElementById('calculate');
    const clearBtn = document.getElementById('clear');
    const drawBracketBtn = document.getElementById('draw-bracket');
    const octavosContainer = document.getElementById('octavos-container');
    const cuartosContainer = document.getElementById('cuartos-container');
    const semifinalesContainer = document.getElementById('semifinales-container');
    const finalContainer = document.getElementById('final-container');
    const bracketCanvas = document.getElementById('bracket-canvas');

    // Colores para los equipos
    const teamColors = [
        '#75AADB', '#48A248', '#DB7575', '#DBA275', 
        '#A275DB', '#75DBA2', '#DBB275', '#7575DB'
    ];

    // Generar inputs para los equipos
    function generateTeamInputs(container, zone) {
        for (let i = 1; i <= 8; i++) {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'team-input';
            
            const label = document.createElement('label');
            label.textContent = `${i}° Equipo ${zone}:`;
            
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.placeholder = `Nombre del equipo`;
            nameInput.id = `${zone.toLowerCase()}-team-${i}-name`;
            nameInput.dataset.zone = zone;
            nameInput.dataset.position = i;
            
            const pointsInput = document.createElement('input');
            pointsInput.type = 'number';
            pointsInput.placeholder = 'Puntos';
            pointsInput.id = `${zone.toLowerCase()}-team-${i}-points`;
            pointsInput.dataset.zone = zone;
            pointsInput.dataset.position = i;
            
            teamDiv.appendChild(label);
            teamDiv.appendChild(nameInput);
            teamDiv.appendChild(pointsInput);
            
            container.appendChild(teamDiv);
        }
    }

    // Cargar datos guardados
    function loadSavedData() {
        const savedData = localStorage.getItem('tournamentData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Llenar los inputs con los datos guardados
            for (const zone in data) {
                for (let i = 1; i <= 8; i++) {
                    const team = data[zone][i-1];
                    if (team) {
                        document.getElementById(`${zone}-team-${i}-name`).value = team.name;
                        document.getElementById(`${zone}-team-${i}-points`).value = team.points;
                    }
                }
            }
        }
    }

    // Guardar datos en localStorage
    function saveData() {
        const data = {
            a: [],
            b: []
        };
        
        for (let i = 1; i <= 8; i++) {
            const teamA = {
                name: document.getElementById(`a-team-${i}-name`).value,
                points: parseInt(document.getElementById(`a-team-${i}-points`).value),
                position: i,
                zone: 'A'
            };
            
            const teamB = {
                name: document.getElementById(`b-team-${i}-name`).value,
                points: parseInt(document.getElementById(`b-team-${i}-points`).value),
                position: i,
                zone: 'B'
            };
            
            data.a.push(teamA);
            data.b.push(teamB);
        }
        
        localStorage.setItem('tournamentData', JSON.stringify(data));
        return data;
    }

    // Calcular los cruces
    function calculateCrosses() {
        const data = saveData();
        
        // Limpiar contenedores
        octavosContainer.innerHTML = '';
        cuartosContainer.innerHTML = '';
        semifinalesContainer.innerHTML = '';
        finalContainer.innerHTML = '';
        
        // Calcular octavos de final
        const octavos = [];
        for (let i = 1; i <= 8; i++) {
            const teamA = data.a[i-1];
            const teamB = data.b[8-i];
            
            octavos.push({
                team1: teamA,
                team2: teamB,
                winner: teamA.points >= teamB.points ? teamA : teamB
            });
        }
        
        // Mostrar octavos
        displayCrosses(octavos, octavosContainer, 'Octavos de Final');
        
        // Calcular cuartos de final
        const cuartos = [
            { team1: octavos[0].winner, team2: octavos[4].winner, winner: null },
            { team1: octavos[1].winner, team2: octavos[5].winner, winner: null },
            { team1: octavos[2].winner, team2: octavos[6].winner, winner: null },
            { team1: octavos[3].winner, team2: octavos[7].winner, winner: null }
        ];
        
        // Determinar ganadores de cuartos (por puntos)
        cuartos.forEach(match => {
            match.winner = match.team1.points >= match.team2.points ? match.team1 : match.team2;
        });
        
        // Mostrar cuartos
        displayCrosses(cuartos, cuartosContainer, 'Cuartos de Final');
        
        // Calcular semifinales
        const semifinales = [
            { team1: cuartos[0].winner, team2: cuartos[2].winner, winner: null },
            { team1: cuartos[1].winner, team2: cuartos[3].winner, winner: null }
        ];
        
        // Determinar ganadores de semifinales (por puntos)
        semifinales.forEach(match => {
            match.winner = match.team1.points >= match.team2.points ? match.team1 : match.team2;
        });
        
        // Mostrar semifinales
        displayCrosses(semifinales, semifinalesContainer, 'Semifinales');
        
        // Calcular final
        const final = {
            team1: semifinales[0].winner,
            team2: semifinales[1].winner,
            winner: null
        };
        
        // Determinar ganador de la final (por puntos)
        final.winner = final.team1.points >= final.team2.points ? final.team1 : final.team2;
        
        // Mostrar final
        displayCrosses([final], finalContainer, 'Final');
        
        return { octavos, cuartos, semifinales, final };
    }

    // Mostrar los cruces en el contenedor
    function displayCrosses(crosses, container, title) {
        crosses.forEach((cross, index) => {
            const crossDiv = document.createElement('div');
            crossDiv.className = 'cross';
            
            const crossTitle = document.createElement('h3');
            crossTitle.textContent = `${title} ${index + 1}`;
            
            const teamsDiv = document.createElement('div');
            teamsDiv.className = 'teams';
            
            const team1Div = document.createElement('div');
            team1Div.className = 'team';
            
            const team1Color = document.createElement('div');
            team1Color.className = 'team-color';
            team1Color.style.backgroundColor = teamColors[cross.team1.position - 1];
            
            const team1Name = document.createElement('span');
            team1Name.textContent = `${cross.team1.name} (${cross.team1.points} pts)`;
            
            team1Div.appendChild(team1Color);
            team1Div.appendChild(team1Name);
            
            const vsSpan = document.createElement('span');
            vsSpan.textContent = 'vs';
            vsSpan.style.margin = '0 10px';
            vsSpan.style.fontWeight = 'bold';
            
            const team2Div = document.createElement('div');
            team2Div.className = 'team';
            
            const team2Color = document.createElement('div');
            team2Color.className = 'team-color';
            team2Color.style.backgroundColor = teamColors[cross.team2.position - 1];
            
            const team2Name = document.createElement('span');
            team2Name.textContent = `${cross.team2.name} (${cross.team2.points} pts)`;
            
            team2Div.appendChild(team2Color);
            team2Div.appendChild(team2Name);
            
            teamsDiv.appendChild(team1Div);
            teamsDiv.appendChild(vsSpan);
            teamsDiv.appendChild(team2Div);
            
            const winnerDiv = document.createElement('div');
            winnerDiv.className = 'winner';
            winnerDiv.style.marginTop = '10px';
            winnerDiv.style.fontWeight = 'bold';
            winnerDiv.style.color = 'var(--accent-color)';
            
            const winnerColor = document.createElement('div');
            winnerColor.className = 'team-color';
            winnerColor.style.backgroundColor = teamColors[cross.winner.position - 1];
            winnerColor.style.display = 'inline-block';
            winnerColor.style.marginRight = '5px';
            
            const winnerText = document.createElement('span');
            winnerText.textContent = `Ganador: ${cross.winner.name} (${cross.winner.points} pts)`;
            
            winnerDiv.appendChild(winnerColor);
            winnerDiv.appendChild(winnerText);
            
            crossDiv.appendChild(crossTitle);
            crossDiv.appendChild(teamsDiv);
            crossDiv.appendChild(winnerDiv);
            
            container.appendChild(crossDiv);
        });
    }

    // Dibujar el bracket visual
    function drawBracket() {
        const results = calculateCrosses();
        bracketCanvas.innerHTML = '';
        
        const bracketDiv = document.createElement('div');
        bracketDiv.className = 'bracket';
        
        // Octavos de final
        const octavosRound = document.createElement('div');
        octavosRound.className = 'round';
        
        results.octavos.forEach((match, index) => {
            const matchDiv = createMatchElement(match, `Octavos ${index + 1}`);
            octavosRound.appendChild(matchDiv);
        });
        
        bracketDiv.appendChild(octavosRound);
        
        // Cuartos de final
        const cuartosRound = document.createElement('div');
        cuartosRound.className = 'round';
        
        results.cuartos.forEach((match, index) => {
            const matchDiv = createMatchElement(match, `Cuartos ${index + 1}`);
            
            // Conector
            const connector = document.createElement('div');
            connector.className = 'connector';
            
            matchDiv.appendChild(connector);
            cuartosRound.appendChild(matchDiv);
        });
        
        bracketDiv.appendChild(cuartosRound);
        
        // Semifinales
        const semisRound = document.createElement('div');
        semisRound.className = 'round';
        
        results.semifinales.forEach((match, index) => {
            const matchDiv = createMatchElement(match, `Semifinal ${index + 1}`);
            
            // Conector
            const connector = document.createElement('div');
            connector.className = 'connector';
            
            matchDiv.appendChild(connector);
            semisRound.appendChild(matchDiv);
        });
        
        bracketDiv.appendChild(semisRound);
        
        // Final
        const finalRound = document.createElement('div');
        finalRound.className = 'round';
        
        const finalDiv = createMatchElement(results.final, 'Final');
        finalRound.appendChild(finalDiv);
        
        bracketDiv.appendChild(finalRound);
        
        bracketCanvas.appendChild(bracketDiv);
    }

    // Crear elemento de partido para el bracket
    function createMatchElement(match, title) {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        
        const titleDiv = document.createElement('div');
        titleDiv.textContent = title;
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '5px';
        titleDiv.style.color = 'var(--primary-color)';
        
        const team1Div = document.createElement('div');
        team1Div.className = 'match-team';
        
        const team1Color = document.createElement('div');
        team1Color.className = 'team-color';
        team1Color.style.backgroundColor = teamColors[match.team1.position - 1];
        
        const team1Name = document.createElement('span');
        team1Name.textContent = match.team1.name;
        
        team1Div.appendChild(team1Color);
        team1Div.appendChild(team1Name);
        
        const team2Div = document.createElement('div');
        team2Div.className = 'match-team';
        
        const team2Color = document.createElement('div');
        team2Color.className = 'team-color';
        team2Color.style.backgroundColor = teamColors[match.team2.position - 1];
        
        const team2Name = document.createElement('span');
        team2Name.textContent = match.team2.name;
        
        team2Div.appendChild(team2Color);
        team2Div.appendChild(team2Name);
        
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'match-team';
        winnerDiv.style.marginTop = '5px';
        winnerDiv.style.fontWeight = 'bold';
        
        const winnerColor = document.createElement('div');
        winnerColor.className = 'team-color';
        winnerColor.style.backgroundColor = teamColors[match.winner.position - 1];
        
        const winnerName = document.createElement('span');
        winnerName.textContent = match.winner.name;
        
        winnerDiv.appendChild(winnerColor);
        winnerDiv.appendChild(winnerName);
        
        matchDiv.appendChild(titleDiv);
        matchDiv.appendChild(team1Div);
        matchDiv.appendChild(team2Div);
        matchDiv.appendChild(winnerDiv);
        
        return matchDiv;
    }

    // Limpiar todos los datos
    function clearData() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
        inputs.forEach(input => {
            input.value = '';
        });
        
        octavosContainer.innerHTML = '';
        cuartosContainer.innerHTML = '';
        semifinalesContainer.innerHTML = '';
        finalContainer.innerHTML = '';
        bracketCanvas.innerHTML = '';
        
        localStorage.removeItem('tournamentData');
    }

    // Event listeners
    calculateBtn.addEventListener('click', calculateCrosses);
    clearBtn.addEventListener('click', clearData);
    drawBracketBtn.addEventListener('click', drawBracket);

    // Inicializar la aplicación
    generateTeamInputs(zoneAInputs, 'A');
    generateTeamInputs(zoneBInputs, 'B');
    loadSavedData();
});