import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface StockData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

interface StockChartProps {
  data: StockData[];
}

const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 40 };
    const width = 1200 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const fontFamily = "Barlow";

    // Parse the Date strings to JavaScript Date objects
    const parseDate = d3.timeParse("%Y-%m-%d");
    const parsedData = data.map((d) => ({
      ...d,
      Date: parseDate(d.Date) as Date,
    }));

    // Create scales using parsed Date objects
    const x = d3
      .scaleBand<Date>()
      .domain(parsedData.map((d) => d.Date))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(parsedData, (d) => d.Low * 0.95)!,
        d3.max(parsedData, (d) => d.High)!,
      ])
      .nice()
      .range([height, 0]);

    // Create a separate y-scale for the volume bars
    const yVolume = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.Volume)!])
      .range([height, height * 0.8]); // Volume bars will take up 40% of the chart height

    // Generate ticks for the x-axis every 5 days if data has 100 or more days
    const xTicks =
      parsedData.length >= 100
        ? parsedData
            .map((d, i) => (i % 5 === 0 ? d.Date : null))
            .filter((d) => d !== null)
        : parsedData.map((d) => d.Date);

    const xAxis = d3
      .axisBottom(x)
      .tickValues(xTicks as Date[])
      .tickFormat(d3.timeFormat("%d"));

    const yAxis = d3.axisLeft(y).ticks(10);

    // background color
    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white");

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .style("font-family", fontFamily)
      .style("font-weight", 600);

    // Function to add horizontal grid lines
    const makeYGridLines = () => d3.axisLeft(y).ticks(10);

    // Add horizontal grid lines
    chart
      .append("g")
      .attr("class", "grid")
      .call(
        makeYGridLines()
          .tickSize(-width)
          .tickFormat(null as any)
      )
      .selectAll(".tick line")
      .attr("stroke", "black")
      .attr("stroke-opacity", 0.1);

    // Add vertical grid lines
    chart
      .selectAll(".grid-line-vertical")
      .data(parsedData)
      .enter()
      .append("line")
      .attr("class", "grid-line-vertical")
      .attr("x1", (d) => x(d.Date)! + x.bandwidth() / 2)
      .attr("x2", (d) => x(d.Date)! + x.bandwidth() / 2)
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "black")
      .attr("stroke-opacity", 0.1);

    // X Axis
    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("class", "x-axis")
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "black")
      .style("font-family", fontFamily);

    chart.select(".x-axis").selectAll("path").attr("stroke", "black");
    chart.select(".x-axis").selectAll("line").attr("stroke", "black");

    // Y Axis
    chart
      .append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "black")
      .style("font-family", fontFamily);

    chart.select(".y-axis").selectAll("path").attr("stroke", "black");
    chart.select(".y-axis").selectAll("line").attr("stroke", "black");

    // Draw stems (high-low lines)
    chart
      .selectAll(".stem")
      .data(parsedData)
      .enter()
      .append("line")
      .attr("class", "stem")
      .attr("x1", (d) => x(d.Date)! + x.bandwidth() / 2)
      .attr("x2", (d) => x(d.Date)! + x.bandwidth() / 2)
      .attr("y1", (d) => y(d.High))
      .attr("y2", (d) => y(d.Low))
      .attr("stroke", "black");

    // Draw candlestick rectangles
    chart
      .selectAll(".candlestick")
      .data(parsedData)
      .enter()
      .append("rect")
      .attr("class", "candlestick")
      .attr("x", (d) => x(d.Date)!)
      .attr("y", (d) => y(Math.max(d.Open, d.Close)))
      .attr("width", x.bandwidth())
      .attr("height", (d) => Math.abs(y(d.Open) - y(d.Close)))
      .attr("fill", (d) => (d.Open > d.Close ? "red" : "green"))
      .on("mouseover", function (_event, d) {
        const rect = this.getBoundingClientRect();
        const svgWidth = svgRef.current!.clientWidth;
        const tooltip = d3.select(tooltipRef.current);

        const xPosition = rect.left + window.scrollX + rect.width / 2;

        if (xPosition > svgWidth / 2) {
          // Position tooltip to the left of the candlestick
          tooltip
            .style("left", `${rect.left - 156}px`)
            .style("top", `${rect.top - 100}px`);
        } else {
          // Position tooltip to the right of the candlestick
          tooltip
            .style("left", `${rect.right + 4}px`)
            .style("top", `${rect.top - 100}px`);
        }

        tooltip.style("opacity", 1).html(
          `<b>Date:</b> ${d3.timeFormat("%m-%d-%Y")(d.Date)}<br/>
            <b>Open:</b> ${d.Open.toFixed(2)}<br/>
            <b>High:</b> ${d.High.toFixed(2)}<br/>
            <b>Low:</b> ${d.Low.toFixed(2)}<br/>
            <b>Close:</b> ${d.Close.toFixed(2)}<br/>
            <b>Volume:</b> ${d.Volume}`
        );
      })
      .on("mouseout", () => {
        d3.select(tooltipRef.current).style("opacity", 0);
      });

    // Add volume bars
    chart
      .selectAll(".volume-bar")
      .data(parsedData)
      .enter()
      .append("rect")
      .attr("class", "volume-bar")
      .attr("x", (d) => x(d.Date)! + x.bandwidth() * 0.1) // Center the bars (it is 0.1 because we use 0.8 width)
      .attr("y", (d) => yVolume(d.Volume))
      .attr("width", x.bandwidth() * 0.8)
      .attr("height", (d) => height - yVolume(d.Volume))
      .attr("fill", "grey")
      .attr("opacity", 0.5);

    // Add month labels
    const months = Array.from(
      new Set(parsedData.map((d) => d.Date.getMonth()))
    );

    const monthGroups = chart
      .selectAll(".month-group")
      .data(months)
      .enter()
      .append("g")
      .attr("class", "month-group")
      .attr("transform", (d) => {
        const monthData = parsedData.filter(
          (dateObj) => dateObj.Date.getMonth() === d
        );
        const middleDate = monthData[Math.floor(monthData.length / 2)].Date;
        return `translate(${x(middleDate)! + x.bandwidth() / 2},${
          height + 40
        })`;
      });

    monthGroups
      .append("text")
      .text((month) => {
        const monthData = parsedData.find((d) => d.Date.getMonth() === month);
        const monthStr = d3.timeFormat("%b")(monthData!.Date);
        const yearStr = d3.timeFormat("%y")(monthData!.Date);
        return `${monthStr} '${yearStr}`;
      })
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .style("text-transform", "uppercase")
      .style("font-size", "14px")
      .style("font-weight", "700");
  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <svg className="chart" ref={svgRef} width={1200} height={600}></svg>
      <div className="tooltip" ref={tooltipRef}></div>
    </div>
  );
};

export default StockChart;
