/* * * * * * * * * * * * * *
 *           MAIN           *
 * * * * * * * * * * * * * */

// init global variables, switches, helper functions
let barChart, mapVis, spiderChart, endangeredBarChart, endangeredInfoChart, chord, bumpChart, heatChart, snapshot;
let selectedState = "California";
let selectedEndangeredPark = "Great Smoky Mountains National Park";

// load data using promises
let promises = [
  d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"),
  d3.csv("data/parks.csv"),
  d3.csv("data/species.csv"),
  d3.csv("data/park_data_processed.csv", (row) => {
    row.Acres = +row.Acres;
    row.Species_ID_nunique = +row.Species_ID_nunique;
    row.Species_ID_Rare = +row.Species_ID_Rare;
    row.Species_ID_Endangered = +row.Species_ID_Endangered;
    row.Species_ID_Native = +row.Species_ID_Native;
    return row;
  }),
  d3.csv("data/visitors.csv"),
];

Promise.all(promises)
  .then(function (data) {
    initMainPage(data);
  })
  .catch(function (err) {
    console.log(err);
  });

// initMainPage
function initMainPage(allDataArray) {
  // log data
  console.log(allDataArray);

  // activity 2, force layout
  mapVis = new MapVis("mapDiv", allDataArray[0], allDataArray[1], allDataArray[2]);
  barChart = new BarChart("barDiv", allDataArray[1], allDataArray[2]);
  bumpChart = new BumpChart("bumpDiv", allDataArray[4]);

  heatChart = new HeatChart("heatDiv", allDataArray[4]);

  snapshot = new SnapshotVis("snapshot", allDataArray[4]);

  // // Chart 5 (Spider Chart)
  spiderChart = new SpiderChart("spiderChart", allDataArray[3]);

  // Chart 6 - Endangered Species
  endangeredBarChart = new EndangeredBarChart("endangeredBarDiv", allDataArray[1], allDataArray[2], allDataArray[4]);
  endangeredInfoChart = new EndangeredInfoChart("endangeredBarDiv", allDataArray[1], allDataArray[2], allDataArray[4]);

  // Chart 7 - Endangered Species by Park
  mapSpeciesChart = new MapSpecies("mapSpecies", allDataArray[1], allDataArray[2], [37.8, -96]);

  // Chord
  matrix = [
    [204, 0, 0, 0],
    [0, 488, 0, 0],
    [0, 0, 855, 0],
    [0, 0, 0, 332],
  ];

  // chordChart = new Chord("chord", matrix);
}

// Used for SpiderChart
function updateParks() {
  console.log("Updating Parks");

  spiderChart.wrangleData();
}

// Used for endangered charts
let selectedHeatYear = document.getElementById("yearSelector").value;

function yearChange() {
  selectedHeatYear = document.getElementById("yearSelector").value;
  heatChart.wrangleData();
}

// Used for endangered charts
let selectedEndangered = document.getElementById("endangeredSelector").value;

function endangeredChange() {
  selectedEndangered = document.getElementById("endangeredSelector").value;
  endangeredInfoChart.wrangleData();
}

// Fullpage Layout Settings -- Source: https://alvarotrigo.com/fullPage/
var myFullpage = new fullpage("#fullpage", {
  // Navigation
  menu: "#menu",
  lockAnchors: false,
  anchors: ["firstPage", "secondPage"],
  navigation: true,
  navigationPosition: "right",
  navigationTooltips: [""],
  showActiveTooltip: false,
  slidesNavigation: false,
  slidesNavPosition: "bottom",

  // Scrolling
  css3: true,
  scrollingSpeed: 700,
  autoScrolling: true,
  fitToSection: true,
  fitToSectionDelay: 600,
  scrollBar: false,
  easing: "easeInOutCubic",
  easingcss3: "ease",
  loopBottom: false,
  loopTop: false,
  loopHorizontal: true,
  continuousVertical: false,
  continuousHorizontal: false,
  scrollHorizontally: false,
  interlockedSlides: false,
  dragAndMove: false,
  offsetSections: false,
  resetSliders: false,
  fadingEffect: false,
  normalScrollElements: "#conservation-list",
  scrollOverflow: true,
  scrollOverflowMacStyle: false,
  scrollOverflowReset: false,
  touchSensitivity: 15,
  bigSectionsDestination: null,

  // Accessibility
  keyboardScrolling: true,
  animateAnchor: true,
  recordHistory: true,

  // Design
  controlArrows: true,
  controlArrowsHTML: ['<div class="fp-arrow"></div>', '<div class="fp-arrow"></div>'],
  verticalCentered: true,
  sectionsColor: [], //["#C8DBBE", "#EDE4E0", "#EDE4E0", "#EDE4E0", "#EDE4E0", "#EDE4E0", "#EDE4E0", "#C8DBBE"],
  // paddingTop: "3em",
  paddingBottom: "10px",
  fixedElements: "#header, .footer",
  responsiveWidth: 0,
  responsiveHeight: 0,
  responsiveSlides: false,
  parallax: false,
  parallaxOptions: { type: "reveal", percentage: 62, property: "translate" },
  dropEffect: false,
  dropEffectOptions: { speed: 2300, color: "#F82F4D", zIndex: 9999 },
  waterEffect: false,
  waterEffectOptions: { animateContent: true, animateOnMouseMove: true },
  cards: false,
  cardsOptions: { perspective: 100, fadeContent: true, fadeBackground: true },

  // Custom selectors
  sectionSelector: ".section",
  slideSelector: ".slide",

  lazyLoading: true,
  observer: true,
  credits: { enabled: false, label: "Christopher Cheng, Ishaan Prasad, Omar Shareef", position: "right" },

  // Events
  beforeLeave: function (origin, destination, direction, trigger) {},
  onLeave: function (origin, destination, direction, trigger) {},
  afterLoad: function (origin, destination, direction, trigger) {},
  afterRender: function () {},
  afterResize: function (width, height) {},
  afterReBuild: function () {},
  afterResponsive: function (isResponsive) {},
  afterSlideLoad: function (section, origin, destination, direction, trigger) {},
  onSlideLeave: function (section, origin, destination, direction, trigger) {},
  onScrollOverflow: function (section, slide, position, direction) {},
});
