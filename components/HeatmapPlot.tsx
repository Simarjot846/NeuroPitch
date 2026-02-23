"use client";

import React from "react";
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";

const CustomPlot = createPlotlyComponent(Plotly);

export default function HeatmapPlot(props: any) {
    return <CustomPlot {...props} />;
}
