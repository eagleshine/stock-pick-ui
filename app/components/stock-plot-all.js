/* globals d3,techan */
import Ember from 'ember';

/**
 * Change type, rsi, macd etc. on-the-fly and use redraw method to re-render your charts.
 *
 * @author Andreev <andreev1024@gmail.com>
 * @version ver 1.0 added on 2016-03-05
 * @access  public
 */
export default Ember.Component.extend({
  allowZoom: true,
  //close price annotation
  showCloseAnnotation: false,
  dateFormat: '%d-%b-%y',
  timeAnnotationFormat: '%Y-%m-%d',
  timeAnnotationWidth: 65,
  yAnnotationFormat: ',.2f',
  yAnnotationText: 'Price ($)',
  percentAnnotationFormat: '+.1%',
  volumeAnnotationFormat: ',.3s',
  xScaleLength: null,
  currentUrl: null,
  identificator: null,
  svg: null,
  type: 'candlestick',
  macd: true,
  rsi: true,
  ichimoku: false,
  sma0: false,
  sma1: false,
  ema2: false,
  resetSelector: '.reset',
  allIndicators: { //  edit if u add new indicator
    'macd': {
      'separateClip': true
    },
    'rsi': {
      'separateClip': true
    },
    'ichimoku': {
      'separateClip': false
    },
    'sma0': {
      'separateClip': false
    },
    'sma1': {
      'separateClip': false
    },
    'ema2': {
      'separateClip': false
    },

  },
  enabledIndicators: Ember.computed('macd', 'rsi', 'ichimoku', 'sma0', 'sma1', 'ema2', function() { //  edit if u add new indicator
    const allIndicators = this.get('allIndicators');
    let enabledIndicators = [];
    for (let indicatorName in allIndicators) {
      if (allIndicators.hasOwnProperty(indicatorName) && this.get(indicatorName)) {
        enabledIndicators.push(indicatorName);
      }
    }

    return enabledIndicators;
  }),
  height: 500,
  chartHeight: 305,
  width: 900,
  indicatorHeight: 65,
  indicatorPadding: 5,
  margin: {
    top: 20,
    right: 50,
    bottom: 30,
    left: 50
  },
  _chartHeight: 305,
  dim: Ember.computed('width', 'height', 'margin', '_chartHeight', 'indicatorHeight', 'indicatorPadding', function() {
    return {
      width: this.get('width'),
      height: this.get('height'),
      margin: this.get('margin'),
      chart: {
        height: this.get('_chartHeight')
      },
      indicator: {
        height: this.get('indicatorHeight'),
        padding: this.get('indicatorPadding')
      }
    };
  }),
  actions: {
    redraw() {
      this.redraw();
    }
  },
  init() {
    this._super(...arguments);
    console.log(this.get('currentUrl'));

    //if (!this.get('currentUrl')) {
    //  throw new Error('Required argument missed: currentUrl');
    //}

    this.set('identificator', 'plot-' + Math.floor(Math.random() * (9000000 - 1000000) + 1000000));
  },
  refreshChartHeight() {
    const dim = this.get('dim');
    const allIndicators = this.get('allIndicators');
    const fullIndeicatorHeight = dim.indicator.height + dim.indicator.padding;
    let i = 0;
    for (let indicatorName in allIndicators) {
      let propertyIsset = allIndicators.hasOwnProperty(indicatorName);
      let idicatorUseSeparateClip = allIndicators[indicatorName]['separateClip'];
      let isEnable = this.isIndicatorEnable(indicatorName);
      if (propertyIsset && idicatorUseSeparateClip && !isEnable) {
        i++;
      }
    }

    this.set('_chartHeight', this.get('chartHeight') + i * fullIndeicatorHeight);
  },
  didInsertElement() {
    this._super(...arguments);

    const dim = this.get('dim');
    const svg = d3.select('#' + this.get('identificator'))
      .attr('width', dim.width)
      .attr('height', dim.height);

    this.set('svg', svg);
    this.draw();

    this.updatePlotWidth = () => {
      Ember.run.bind(this, Ember.run.throttle(this, function () {
        let width = this.$().width();
        this.set('width', width);
        this.get('svg').attr('width', width);
        Ember.run.once(this, this.redraw);
      }, 300));
    };
    Ember.$(window).on('resize', this.updatePlotWidth);
    this.updatePlotWidth();
  },
  willDestroyElement() {
    this._super(...arguments);
    Ember.$(window).off('resize', this.updatePlotWidth);
    this.updatePlotWidth = null;
  },
  isIndicatorEnable(indicatorName) {
    return Ember.$.inArray(indicatorName, this.get('enabledIndicators')) !== -1;
  },
  getClipUrl(clipId) {
    return "url(" + this.get('currentUrl') + "#" + clipId + ")";
  },
  redraw() {
    this.get('svg').selectAll('*').remove();
    this.draw();
  },
  draw() {
    this.refreshChartHeight();
    const isRsi = this.isIndicatorEnable('rsi');
    const isMacd = this.isIndicatorEnable('macd');
    const isIchimoku = this.isIndicatorEnable('ichimoku');
    const isSma0 = this.isIndicatorEnable('sma0');
    const isSma1 = this.isIndicatorEnable('sma1');
    const isEma2 = this.isIndicatorEnable('ema2');
    const dim = this.get('dim');
    const component = this;

    dim.plot = {
      width: dim.width - dim.margin.left - dim.margin.right,
      height: dim.height - dim.margin.top - dim.margin.bottom
    };
    dim.indicator.top = dim.chart.height + dim.indicator.padding;
    dim.indicator.bottom = dim.indicator.top + dim.indicator.height + dim.indicator.padding;

    const indicatorTop = d3.scaleLinear()
      .range([dim.indicator.top, dim.indicator.bottom]);

    const parseDate = d3.timeParse(this.get('dateFormat'));

    const zoom = d3.zoom();
    if(this.get('allowZoom')){
      zoom.on("zoom", zoomed);
    }

    //TODO: check scaleExtent in d3 v4
    if (Ember.isArray(this.get('scaleExtent')) && this.get('scaleExtent').length === 2) {
      zoom.scaleExtent(this.get('scaleExtent'));
    }

    const zoomPercent = d3.zoom();

    const x = techan.scale.financetime();
    if(this.get('xScaleLength')){
      x.range([0, Math.max(this.get('xScaleLength'), dim.plot.width)]);
    } else {
      x.range([0, dim.plot.width]);
    }

    const y = d3.scaleLinear()
      .range([dim.chart.height - dim.indicator.height - dim.indicator.padding, 0]);

    const yPercent = y.copy(); // Same as y at this stage, will get a different domain later

    const yVolume = d3.scaleLinear()
      .range([indicatorTop(-1) + dim.indicator.height, indicatorTop(-1)]);

    const chartType = this.get('type');

    const chart = techan.plot[chartType]()
      .xScale(x)
      .yScale(y);

    const sma0 = techan.plot.sma()
      .xScale(x)
      .yScale(y);

    const sma1 = techan.plot.sma()
      .xScale(x)
      .yScale(y);

    const ema2 = techan.plot.ema()
      .xScale(x)
      .yScale(y);

    const volume = techan.plot.volume()
      .accessor(chart.accessor()) // Set the accessor to a chart (ohlc) accessor so we get highlighted bars
      .xScale(x)
      .yScale(yVolume);

    const xAxis = d3.axisBottom(x);

    const timeAnnotation = techan.plot.axisannotation()
      .axis(xAxis)
      .orient('bottom') //hy
      .format(d3.timeFormat(this.get('timeAnnotationFormat')))
      .width(this.get('timeAnnotationWidth'))
      .translate([0, dim.plot.height]);

    const yAxis = d3.axisRight(y);

    const chartAnnotation = techan.plot.axisannotation()
      .axis(yAxis)
      .orient('right') //hy
      .format(d3.format(this.get('yAnnotationFormat')))
      .translate([x(1), 0]);

    const closeAnnotation = techan.plot.axisannotation();
    if (this.get('showCloseAnnotation')) {
      closeAnnotation.axis(yAxis)
        .orient('right')
        .accessor(chart.accessor())
        .format(d3.format(this.get('yAnnotationFormat')))
        .translate([x(1), 0]);
    }

    const percentAxis = d3.axisLeft(yPercent)
      .tickFormat(d3.format(this.get('percentAnnotationFormat')));

    const percentAnnotation = techan.plot.axisannotation()
      .axis(percentAxis)
      .orient('left');

    const volumeAxis = d3.axisLeft(yVolume)
      .ticks(3)
      .tickFormat(d3.format(this.get('volumeAnnotationFormat')));

    const volumeAnnotation = techan.plot.axisannotation()
      .axis(volumeAxis)
      .orient('left')
      .width(35);

    let macdScale;
    let macd;
    let macdAxisLeft;
    let macdAnnotationLeft;
    let macdAxisRight;
    let macdAnnotationRight;
    let macdCrosshair;

    if (isMacd) {
      const indicatorIndex = Ember.$.inArray('macd', this.get('enabledIndicators'));
      macdScale = d3.scaleLinear()
        .range([indicatorTop(indicatorIndex) + dim.indicator.height, indicatorTop(indicatorIndex)]);

      macd = techan.plot.macd()
        .xScale(x)
        .yScale(macdScale);

      macdAxisLeft = d3.axisLeft(macdScale)
        .ticks(3);

      macdAnnotationLeft = techan.plot.axisannotation()
        .axis(macdAxisLeft)
        .orient('left')
        .format(d3.format(',.2f'))
        .translate([x(0), 0]);

      macdAxisRight = d3.axisRight(macdScale)
        .ticks(3);

      macdAnnotationRight = techan.plot.axisannotation()
        .axis(macdAxisRight)
        .orient('right')
        .format(d3.format(',.2f'))
        .translate([x(1), 0])

      macdCrosshair = techan.plot.crosshair()
        .xScale(timeAnnotation.axis().scale())
        .yScale(macdAnnotationLeft.axis().scale())
        .xAnnotation(timeAnnotation)
        .yAnnotation([macdAnnotationLeft, macdAnnotationRight])
        .verticalWireRange([0, dim.plot.height]);
    }

    let rsiScale;
    let rsi;
    let rsiAxisLeft;
    let rsiAnnotationLeft;
    let rsiAxisRight;
    let rsiAnnotationRight;
    let rsiCrosshair;

    if (isRsi) {
      const indicatorIndex = Ember.$.inArray('rsi', this.get('enabledIndicators'));
      //  macdScale.copy()
      rsiScale = d3.scaleLinear()
        .range([indicatorTop(indicatorIndex) + dim.indicator.height, indicatorTop(indicatorIndex)]);

      rsi = techan.plot.rsi()
        .xScale(x)
        .yScale(rsiScale);

      rsiAxisLeft = d3.axisLeft(rsiScale)
        .ticks(3);

      rsiAnnotationLeft = techan.plot.axisannotation()
        .axis(rsiAxisLeft)
        .orient('left')
        .format(d3.format(',.2f'));

      rsiAxisRight = d3.axisRight(rsiScale)
        .ticks(3);

      rsiAnnotationRight = techan.plot.axisannotation()
        .axis(rsiAxisRight)
        .orient('right')
        .format(d3.format(',.2f'))
        .translate([x(1), 0]);

      rsiCrosshair = techan.plot.crosshair()
        .xScale(timeAnnotation.axis().scale())
        .yScale(rsiAnnotationLeft.axis().scale())
        .xAnnotation(timeAnnotation)
        .yAnnotation([rsiAnnotationLeft, rsiAnnotationRight])
        .verticalWireRange([0, dim.plot.height]);
    }

    const chartCrosshair = techan.plot.crosshair()
      .xScale(timeAnnotation.axis().scale())
      .yScale(chartAnnotation.axis().scale())
      .xAnnotation(timeAnnotation)
      .yAnnotation([chartAnnotation, percentAnnotation, volumeAnnotation])
      .verticalWireRange([0, dim.plot.height]);

    let svg = this.get('svg');
    const defs = svg.append("defs");

    defs
      .append("clipPath")
      .attr("id", "chartClip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", dim.plot.width)
      .attr("height", dim.chart.height);

    const indicators = this.get('enabledIndicators');
    defs.selectAll("indicatorClip").data(Object.keys(indicators))
      .enter()
      .append("clipPath")
      .attr("id", function(d, i) {
        return "indicatorClip-" + i;
      })
      .append("rect")
      .attr("x", 0)
      .attr("y", function(d, i) {
        return indicatorTop(i);
      })
      .attr("width", dim.plot.width)
      .attr("height", dim.indicator.height);

    svg = svg.append("g")
      .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + dim.plot.height + ")");

    const chartSelection = svg.append("g")
      .attr("class", "chart")
      .attr("transform", "translate(0,0)");

    chartSelection.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + x(1) + ",0)")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -12)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(this.get('yAnnotationText'));

    chartSelection.append("g")
      .attr("class", "close annotation up");

    chartSelection.append("g")
      .attr("class", "volume")
      .attr("clip-path", this.getClipUrl('chartClip'));

    chartSelection.append("g")
      .attr("class", chartType)
      .attr("clip-path", this.getClipUrl('chartClip'));

    chartSelection.append("g")
      .attr("class", "indicator sma ma-0")
      .attr("clip-path", this.getClipUrl('chartClip'));

    chartSelection.append("g")
      .attr("class", "indicator sma ma-1")
      .attr("clip-path", this.getClipUrl('chartClip'));

    chartSelection.append("g")
      .attr("class", "indicator ema ma-2")
      .attr("clip-path", this.getClipUrl('chartClip'));

    chartSelection.append("g")
      .attr("class", "percent axis");

    chartSelection.append("g")
      .attr("class", "volume axis");

    const indicatorSelection = svg.selectAll("svg > g.indicator")
      .data(indicators)
      .enter()
      .append("g")
      .attr("class", function(d) {
        return d + " indicator";
      });

    indicatorSelection.append("g")
      .attr("class", "axis right")
      .attr("transform", "translate(" + x(1) + ",0)");

    indicatorSelection.append("g")
      .attr("class", "axis left")
      .attr("transform", "translate(" + x(0) + ",0)");

    indicatorSelection.append("g")
      .attr("class", "indicator-plot")
      .attr("clip-path", function(d, i) {
        return component.getClipUrl("indicatorClip-" + i);
      });

    // Add trendlines and other interactions last to be above zoom pane
    svg.append('g')
      .attr("class", "crosshair chart");

    if (isMacd) {
      svg.append('g').attr("class", "crosshair macd");
    }
    if (isRsi) {
      svg.append('g').attr("class", "crosshair rsi");
    }

    d3.select(this.get('resetSelector')).on("click", reset);

    const accessor = chart.accessor();

    const data = this.get('data').map(function(d) {
      return {
        date: parseDate(d.date),
        open: +d.open,
        high: +d.high,
        low: +d.low,
        close: +d.close,
        volume: +d.volume
      };
    }).sort(function(a, b) {
      return d3.ascending(accessor.d(a), accessor.d(b));
    });

    if(!data.length){
      return;
    }

    const indicatorPreRoll = Math.min(33, data.length); // Don't show where indicators don't have data

    x.domain(techan.scale.plot.time(data).domain());
    y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain());
    yPercent.domain(techan.scale.plot.percent(y, accessor(data[indicatorPreRoll])).domain());
    yVolume.domain(techan.scale.plot.volume(data).domain());

    let macdData;
    if (isMacd) {
      macdData = techan.indicator.macd()(data);
      macdScale.domain(techan.scale.plot.macd(macdData).domain());
    }

    let rsiData;
    if (isRsi) {
      rsiData = techan.indicator.rsi()(data);
      rsiScale.domain(techan.scale.plot.rsi(rsiData).domain());
    }

    let ichimoku;
    if (isIchimoku) {
      ichimoku = techan.plot.ichimoku()
        .xScale(x)
        .yScale(y);

      const ichimokuData = techan.indicator.ichimoku()(data);

      chartSelection.append("g")
        .datum(ichimokuData)
        .attr("class", "ichimoku")
        .attr("clip-path", this.getClipUrl("chartClip"))
        .call(ichimoku);
    }

    svg.select("g." + chartType).datum(data).call(chart);
    if(this.get('showCloseAnnotation')){
      svg.select("g.close.annotation").datum([data[data.length - 1]]).call(closeAnnotation);
    }
    svg.select("g.volume").datum(data).call(volume);
    if (isSma0) {
      svg.select("g.sma.ma-0").datum(techan.indicator.sma().period(12)(data)).call(sma0);
    }
    if (isSma1) {
      svg.select("g.sma.ma-1").datum(techan.indicator.sma().period(26)(data)).call(sma1);
    }
    if (isEma2) {
      svg.select("g.ema.ma-2").datum(techan.indicator.ema().period(50)(data)).call(ema2);
    }
    if (isMacd && !Ember.isEmpty(macdData)) {
      svg.select("g.macd .indicator-plot").datum(macdData).call(macd);
    }
    if (isRsi) {
      svg.select("g.rsi .indicator-plot").datum(rsiData).call(rsi);
    }

    svg.select("g.crosshair.chart").call(chartCrosshair).call(zoom);
    if (isMacd && !Ember.isEmpty(macdData)) {
      svg.select("g.crosshair.macd").call(macdCrosshair).call(zoom);
    }
    if (isRsi) {
      svg.select("g.crosshair.rsi").call(rsiCrosshair).call(zoom);
    }

    //stash for zoom
    const zoomableInit =  x.zoomable()
      .clamp(true)
      .domain([indicatorPreRoll, data.length])
      .copy();
    const yInit = y.copy();
    const yPercentInit = yPercent.copy();

    draw();

    function reset() {
      zoom.scale(1);
      zoom.translate([0, 0]);
      draw();
    }

    function zoomed() {
		x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());
        y.domain(d3.event.transform.rescaleY(yInit).domain());
        yPercent.domain(d3.event.transform.rescaleY(yPercentInit).domain());

        draw();
    }

    function draw() {
      svg.select("g.x.axis").call(xAxis);
      svg.select("g.chart .axis").call(yAxis);
      svg.select("g.volume.axis").call(volumeAxis);
      svg.select("g.percent.axis").call(percentAxis);

      // We know the data does not change, a simple refresh that does not perform data joins will suffice.
      if (isIchimoku) {
        svg.select("g.ichimoku").call(ichimoku.refresh);
      }

      if (isMacd && !Ember.isEmpty(macdData)) {
        svg.select("g.macd .axis.left").call(macdAxisLeft);
        svg.select("g.macd .axis.right").call(macdAxisRight);

        svg.select("g.macd .indicator-plot").call(macd.refresh);
        svg.select("g.crosshair.macd").call(macdCrosshair.refresh);
      }

      if (isRsi) {
        svg.select("g.rsi .axis.left").call(rsiAxisLeft);
        svg.select("g.rsi .axis.right").call(rsiAxisRight);

        svg.select("g.rsi .indicator-plot").call(rsi.refresh);
        svg.select("g.crosshair.rsi").call(rsiCrosshair.refresh);
      }

      svg.select("g." + chartType).call(chart.refresh);
      svg.select("g.close.annotation").call(closeAnnotation.refresh);
      svg.select("g.volume").call(volume.refresh);
      if (isSma0) {
        svg.select("g .sma.ma-0").call(sma0.refresh);
      }
      if (isSma1) {
        svg.select("g .sma.ma-1").call(sma1.refresh);
      }
      if (isEma2) {
        svg.select("g .ema.ma-2").call(ema2.refresh);
      }
      svg.select("g.crosshair.chart").call(chartCrosshair.refresh);
    }
  }
});
