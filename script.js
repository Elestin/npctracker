document.addEventListener('DOMContentLoaded', () => {
    const addNpcBtn = document.getElementById('addNpcBtn');
    const clearNpcsBtn = document.getElementById('clearNpcsBtn');
    const sortNpcsSelect = document.getElementById('sortNpcsSelect');
    const npcsContainer = document.getElementById('npcsContainer');
    const importNpcsBtn = document.getElementById('importNpcsBtn');
    const importNpcsInput = document.getElementById('importNpcsInput');

    const colors = [
        { name: "Red", value: "#FF6384" },
        { name: "Orange", value: "#FF9F40" },
        { name: "Yellow", value: "#FFCD56" },
        { name: "Green", value: "#4BC0C0" },
        { name: "Blue", value: "#36A2EB" },
        { name: "Purple", value: "#9966FF" },
        { name: "Pink", value: "#FF66B3" },
        { name: "Brown", value: "#A0522D" },
        { name: "Gray", value: "#C0C0C0" },
        { name: "Black", value: "#000000" }
    ];

    const conditions = ["None", "Blinded", "Charmed", "Deafened", "Frightened", "Grappled", "Incapacitated", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious"];

    importNpcsInput.addEventListener('change', function() {
        // Functionality to read and import the NPC data from the selected file
    });

    addNpcBtn.addEventListener('click', () => addNpcBox());
    clearNpcsBtn.addEventListener('click', () => {
        npcsContainer.innerHTML = '';
        localStorage.clear(); // Also clear saved NPCs in local storage
    });
    sortNpcsSelect.addEventListener('change', () => sortNpcs());

    // Load NPCs from local storage upon page load
    loadNpcsFromLocalStorage();

        // Correctly bind the click event on the import button to trigger the hidden file input
    importNpcsBtn.addEventListener('click', () => {
        importNpcsInput.click();
    });

        importNpcsInput.addEventListener('change', function() {
        importNpcsFromFile(this);
    });


    function addNpcBox(npc = {}) {
        const npcBox = document.createElement('div');
        npcBox.className = 'npcBox';
        npcBox.style.backgroundColor = npc.color || '';
        npcBox.style.color = npc.color === '#000000' ? '#FFFFFF' : ''; // Adjust text color for visibility
        npcBox.innerHTML = `
            <div class="inputField"><label>Name: <input type="text" class="npcName" value="${npc.name || ''}"></label></div>
            <div class="inputField"><label>Initiative: <input type="number" class="npcInitiative" value="${npc.initiative || ''}"></label></div>
            <div class="inputField"><label>HitPoint: <input type="number" class="npcHitPoint" value="${npc.hitPoint || ''}"></label></div>
            <div class="inputField">
                <label>Conditions: <select class="npcConditions">${conditions.map(condition => `<option>${condition}</option>`).join('')}</select></label>
                <div class="conditionsList"></div>
            </div>
            <div class="inputField"><label>Color: 
                <select class="npcColor">${colors.map(color => `<option value="${color.value}" ${npc.color === color.value ? 'selected' : ''}>${color.name}</option>`).join('')}</select>
            </label></div>
            <button class="npcControlBtn duplicateBtn">Duplicate NPC</button>
            <button class="npcControlBtn removeBtn">Remove NPC</button>
        `;
        
        initializeNpcBox(npcBox, npc);
        npcsContainer.appendChild(npcBox);
    }

    function initializeNpcBox(npcBox, npc) {
        const colorSelect = npcBox.querySelector('.npcColor');
        const conditionsSelect = npcBox.querySelector('.npcConditions');
        const conditionsList = npcBox.querySelector('.conditionsList');

        colorSelect.addEventListener('change', function() {
            npcBox.style.backgroundColor = this.value;
            npcBox.style.color = this.value === '#000000' ? '#FFFFFF' : '';
            saveNpcsToLocalStorage();
        });

        conditionsSelect.addEventListener('change', function() {
            if (this.value !== "None") {
                const conditionTag = document.createElement('span');
                conditionTag.textContent = this.value;
                conditionTag.className = 'conditionTag';
                conditionTag.addEventListener('click', () => {
                    conditionTag.remove();
                    saveNpcsToLocalStorage();
                });
                conditionsList.appendChild(conditionTag);
                saveNpcsToLocalStorage();
            }
            this.selectedIndex = 0; // Reset select after adding a condition
        });

        npcBox.querySelector('.duplicateBtn').addEventListener('click', () => duplicateNpc(npcBox));
        npcBox.querySelector('.removeBtn').addEventListener('click', () => {
            npcBox.remove();
            saveNpcsToLocalStorage();
        });

        // Pre-fill conditions for loaded NPCs
        if (npc.conditions) {
            npc.conditions.forEach(condition => {
                const conditionTag = document.createElement('span');
                conditionTag.textContent = condition;
                conditionTag.className = 'conditionTag';
                conditionTag.addEventListener('click', () => {
                    conditionTag.remove();
                    saveNpcsToLocalStorage();
                });
                conditionsList.appendChild(conditionTag);
            });
        }
    }

    function duplicateNpc(originalNpcBox) {
        const npcData = {
            name: originalNpcBox.querySelector('.npcName').value,
            initiative: originalNpcBox.querySelector('.npcInitiative').value,
            hitPoint: originalNpcBox.querySelector('.npcHitPoint').value,
            conditions: Array.from(originalNpcBox.querySelector('.conditionsList').children).map(condition => condition.textContent),
            color: originalNpcBox.querySelector('.npcColor').value
        };
        addNpcBox(npcData);
    }

    function sortNpcs() {
        const sortOption = sortNpcsSelect.value.split('-');
        const field = sortOption[0];
        const order = sortOption[1];

        const sortedNpcs = Array.from(npcsContainer.children)
            .sort((a, b) => {
                const aValue = parseInt(a.querySelector(`.npc${field.charAt(0).toUpperCase() + field.slice(1)}`).value, 10);
                const bValue = parseInt(b.querySelector(`.npc${field.charAt(0).toUpperCase() + field.slice(1)}`).value, 10);
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            });

        npcsContainer.innerHTML = '';
        sortedNpcs.forEach(npc => npcsContainer.appendChild(npc));
    }

    function saveNpcsToLocalStorage() {
        const npcData = Array.from(npcsContainer.children).map(npcBox => ({
            name: npcBox.querySelector('.npcName').value,
            initiative: npcBox.querySelector('.npcInitiative').value,
            hitPoint: npcBox.querySelector('.npcHitPoint').value,
            conditions: Array.from(npcBox.querySelector('.conditionsList').children).map(condition => condition.textContent),
            color: npcBox.querySelector('.npcColor').value
        }));
        localStorage.setItem('npcs', JSON.stringify(npcData));
    }
function loadNpcsFromLocalStorage() {
    const npcData = JSON.parse(localStorage.getItem('npcs'));
    if (npcData) {
        npcData.forEach(npc => addNpcBox(npc));
    }
}


    function importNpcsFromFile(input) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const npcData = JSON.parse(e.target.result);
                    localStorage.setItem('npcs', JSON.stringify(npcData));
                    npcsContainer.innerHTML = ''; // Clear existing NPCs
                    loadNpcsFromLocalStorage(); // Load the new NPCs
                } catch (error) {
                    console.error("Error parsing NPC data:", error);
                    alert("There was an error processing your file. Please ensure it is a valid JSON.");
                }
            };
            reader.readAsText(file);
        }
    }

});
