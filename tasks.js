// Dynamic Task Generator
// Evaluated automatically on load in the browser
const taskBank = (function () {
    const subjectsGroup1 = [
        { d: "Ik", e: "I" }, { d: "Jij", e: "You" }, { d: "Hij", e: "He" }, { d: "Zij", e: "She" }, { d: "Wij", e: "We" }
    ];
    const verbsGaan = [
        { subj: "Ik", d: "ga", e: "am going" }, { subj: "Jij", d: "gaat", e: "are going" }, { subj: "Hij", d: "gaat", e: "is going" }, { subj: "Zij", d: "gaat", e: "is going" }, { subj: "Wij", d: "gaan", e: "are going" }
    ];
    const verbsEten = [
        { subj: "Ik", d: "eet", e: "eat" }, { subj: "Jij", d: "eet", e: "eat" }, { subj: "Hij", d: "eet", e: "eats" }, { subj: "Zij", d: "eet", e: "eats" }, { subj: "Wij", d: "eten", e: "eat" }
    ];
    const verbsDrinken = [
        { subj: "Ik", d: "drink", e: "drink" }, { subj: "Jij", d: "drinkt", e: "drink" }, { subj: "Hij", d: "drinkt", e: "drinks" }, { subj: "Zij", d: "drinkt", e: "drinks" }, { subj: "Wij", d: "drinken", e: "drink" }
    ];

    const places = [
        { d: "naar school", e: "to school" }, { d: "naar de supermarkt", e: "to the supermarket" }, { d: "naar huis", e: "home" }, { d: "naar de bibliotheek", e: "to the library" },
        { d: "naar het strand", e: "to the beach" }, { d: "naar het museum", e: "to the museum" }, { d: "naar het station", e: "to the station" }, { d: "naar kantoor", e: "to the office" }
    ];
    const food = [
        { d: "een appel", e: "an apple" }, { d: "een banaan", e: "a banana" }, { d: "brood", e: "bread" }, { d: "een koekje", e: "a cookie" },
        { d: "kaas", e: "cheese" }, { d: "rijst", e: "rice" }, { d: "groenten", e: "vegetables" }, { d: "een salade", e: "a salad" }, { d: "een boterham", e: "a sandwich" }, { d: "soep", e: "soup" }
    ];
    const drinks = [
        { d: "water", e: "water" }, { d: "koffie", e: "coffee" }, { d: "thee", e: "tea" }, { d: "melk", e: "milk" },
        { d: "bier", e: "beer" }, { d: "appelsap", e: "apple juice" }, { d: "wijn", e: "wine" }, { d: "cola", e: "cola" }, { d: "limonade", e: "lemonade" }, { d: "warme chocomel", e: "hot chocolate" }
    ];
    const times = [
        { d: "vandaag", e: "today" }, { d: "morgen", e: "tomorrow" }, { d: "elke dag", e: "every day" },
        { d: "vaak", e: "often" }, { d: "soms", e: "sometimes" }, { d: "nu", e: "now" }, { d: "altijd", e: "always" }, { d: "nooit", e: "never" }
    ];

    const sentences = [];

    function addSentence(subj, verb, time, obj, isGaan) {
        let d1 = `${subj.d} ${verb.d} ${time.d} ${obj.d}.`;
        let eStr1 = `${subj.e} ${verb.e} ${obj.e} ${time.e}.`;
        sentences.push({ dutch: d1, english: eStr1, hint: "A1: Basic word order", level: "A1" });

        let sLower = subj.d.toLowerCase();
        let d2 = `${time.d} ${verb.d} ${sLower} ${obj.d}.`;
        d2 = d2.charAt(0).toUpperCase() + d2.slice(1);
        sentences.push({ dutch: d2, english: eStr1, hint: "A2: Inversion (starts with time)", level: "A2" });
    }

    for (let time of times) {
        for (let subj of subjectsGroup1) {
            let vGaan = verbsGaan.find(v => v.subj === subj.d);
            for (let place of places) addSentence(subj, vGaan, time, place, true);

            let vEten = verbsEten.find(v => v.subj === subj.d);
            for (let f of food) addSentence(subj, vEten, time, f, false);

            let vDrink = verbsDrinken.find(v => v.subj === subj.d);
            for (let d of drinks) addSentence(subj, vDrink, time, d, false);
        }
    }

    // Seeded random number generator for consistent shuffling
    function mulberries32(a) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }
    const rand = mulberries32(42); // specific seed ensures deterministic output

    // We must sort using our PRNG. sort() is implementation-dependent, 
    // but doing a mapped sort ensures consistency across browsers.
    const mapped = sentences.map((el, i) => {
        return { index: i, value: rand(), el: el };
    });

    // sorting the mapped array
    mapped.sort(function (a, b) {
        return a.value - b.value;
    });

    const shuffled = mapped.map(function (el) {
        return el.el;
    });

    // select 1000 items
    const selected = shuffled.slice(0, 1000);

    const repeatTasks = selected.map(s => ({
        dutch: s.dutch,
        english: s.english,
        level: s.level,
        hint: s.hint
    }));

    const listeningTasks = selected.map(s => ({
        dutch: s.dutch,
        audioText: s.dutch,
        hint: s.hint
    }));

    // Expose exactly 1000 consistent items
    return {
        listeningTasks: listeningTasks,
        repeatTasks: repeatTasks
    };
})();
