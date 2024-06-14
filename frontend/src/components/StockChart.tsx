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

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 60, left: 40 };
    const width = 1200 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

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
        d3.min(parsedData, (d) => d.Low)!,
        d3.max(parsedData, (d) => d.High)!,
      ])
      .nice()
      .range([height, 0]);

    const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%d"));
    const yAxis = d3.axisLeft(y).ticks(10);

    // background color
    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white");

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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
      .attr("fill", "black");

    chart.select(".x-axis").selectAll("path").attr("stroke", "black");
    chart.select(".x-axis").selectAll("line").attr("stroke", "black");

    // Y Axis
    chart
      .append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "black");

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
      .attr("fill", (d) => (d.Open > d.Close ? "red" : "green"));

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
      .style("font-weight", "600")
      .style("font-family", "Roboto, sans-serif");
  }, [data]);

  return <svg ref={svgRef} width={1200} height={600}></svg>;
};

export default StockChart;
