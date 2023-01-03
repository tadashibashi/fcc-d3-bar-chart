import * as d3 from "d3"


// ----------CONSTANTS ----------

const GRAPH_HEIGHT = 400;

const PADDING_X = 40;
const PADDING_Y = 20;

const BAR_WIDTH = 2;
const BAR_GAP = 0;

const DATA_URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";



// ---------- Helpers ----------

// Blocking synchronous GET request
function getData(url: string): {data: Array<[string, number]>} {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();

    return JSON.parse(xhr.response);
}

// Get the quarter of the year (1-indexed) from a zero-indexed month
function getQuarter(month: number) {
    return Math.floor(month / 3) + 1;
}

// Creates a number string with commas
function makeCommaNumber(n: number): string {
    let ret = "";
    let numStr = n.toString();

    // Append decimal fraction, if any
    let startingIndex = numStr.lastIndexOf('.');
    if (startingIndex !== -1)
        ret += numStr.substring(startingIndex);

    // Append comma every third digit
    for (let i = startingIndex === -1 ? numStr.length-1 : startingIndex-1, commaCtr = 0; i >= 0; --i) {

        ret = numStr[i] + ret;
        if (commaCtr === 2 && i !== 0) {
            ret = ',' + ret;
            commaCtr = 0;
        }
        
        ++commaCtr;
    } 

    return ret;
}

// ---------- Main Program ----------

function main() {


    // ---------- Get data synchronously ----------

    const json = getData(DATA_URL);

    // Funcs to translate string to Date and vice-versa
    const timeFormat = d3.timeFormat("%Y-%m-%d");
    const timeParse = d3.timeParse("%Y-%m-%d");

    let data = json.data.map((d) => {
        // TODO: for a full-featured program, data should be validated here...

        return {
            gdp: d[1],
            date: timeParse(d[0])
        };
    });



    // ---------- Create SVG ----------

    const width = (BAR_WIDTH + BAR_GAP) * data.length;
    const height = GRAPH_HEIGHT;

    const svg = d3.select("#app")
        .append("svg")
        .attr("class", "gdp-graph")
        .attr("width", width)
        .attr("height", height);
        


    // ---------- Create Scalers ----------

    const [minGDP, maxGDP] = d3.extent(data, (d) => d.gdp);
    const scaleY = d3.scaleLinear()
        .domain([0, maxGDP])
        .range([height-PADDING_Y, PADDING_Y]);

    const [minDate, maxDate] = d3.extent(data, d => d.date);
    const scaleX = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([PADDING_X, width - PADDING_X]);
    

    // ---------- Create Tooltip ----------

    const tooltip = d3.select("#app").append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip");
    tooltip.append("p")
        .attr("class", "date")
        .attr("data-date", "")
    tooltip.append("p")
        .attr("class", "amount");



    // ---------- Create Bars ----------
    
    const bars = svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("data-date", (d) => timeFormat(d.date))
        .attr("data-gdp", (d) => d.gdp)
        .attr("fill", "black")
        .attr("x", (d, i) => scaleX(d.date))
        .attr("y", (d) => scaleY(d.gdp))
        .attr("width", BAR_WIDTH)
        .attr("height", (d) => height - scaleY(d.gdp) - PADDING_Y)
        .on("mouseenter", function(event, d) {
            d3.select(this)
                .style("fill", "#DDDDFF");
            d3.select(".tooltip")
                .style("top", height - 100 + "px")
                .style("left", event.pageX + 16 + "px")
                .attr("data-date", timeFormat(d.date))
                .transition()
                .duration(400)
                .style("opacity", 1);
            d3.select(".tooltip .date")
                .text(d.date.getFullYear() + " Q" + getQuarter(d.date.getMonth()));
            d3.select(".tooltip .amount")
                .text("$" + makeCommaNumber(d.gdp) + " Billion");
        })
        .on("mouseleave", function(event, d) {
            d3.select(this)
                .style("fill", "black");
            d3.select(".tooltip")
                .transition()
                .duration(400)
                .style("opacity", 0);
        });



    // ---------- Create Axes ----------

    // x-axis
    const axisBottom = d3.axisBottom(scaleX)
        .tickFormat(d3.timeFormat("%Y"));
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${scaleY(0)})`)
        .call(axisBottom);
    
    // y-axis
    const axisLeft = d3.axisLeft(scaleY);
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${scaleX(minDate)}, 0)`)
        .call(axisLeft)
        .attr("class", "ticks");
    
    // gdp text label on y-axis
    svg.append("text")
        .attr("transform", `translate(${54}, ${200}) rotate(-90)`)
        .attr("x", "0")
        .attr("y", "0")
        .style("font-size", ".8rem")
        .text("Gross Domestic Product")  
}

main();
