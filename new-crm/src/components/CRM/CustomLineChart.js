import React, { PureComponent } from 'react'
import { LineChart, ResponsiveContainer, XAxis, YAxis, Line, Tooltip, Legend } from 'recharts'
import { MoonLoader } from 'react-spinners'
class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, stroke, payload } = this.props;
    console.log('0000000000000000000000000', x, y, payload);
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" >
          {payload.value}
        </text>
        <text x={-30} y={16} dy={16} textAnchor="middle" fill="#666" fontWeight={"bold"}>
          {23}
        </text>
      </g>
    );
  }
}
class CustomLineChart extends PureComponent {
  render() {
    return this.props.loader ?
      <div className="d-flex flex-row justify-content-center align-items-center h-100">
        <MoonLoader
          color={"#1B94B7"}
          loading={this.props.loader}
          size={80}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
      :
      <div>
        <ResponsiveContainer width={"100%"} height={300}>
          <LineChart
            width={500}
            height={300}
            data={this.props.data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}

          >
            <XAxis dataKey={this.props.xDataKey} height={50} tickFormatter={this.props.XFormatter} tick={(props) => {
              let { x, y, stroke, payload, tickFormatter } = props
              console.log('0000000000000000000000000', props);

              const dataKeyArray = this.props.bardataConfig.map(item => item.dataKey);
              const currentdata = this.props.data[payload.index]
              let sum = 0
              let cnt = 0
              dataKeyArray.map(item => {
                if (currentdata[item]) {
                  cnt += 1
                  sum += currentdata[item]
                }
              })
              if (this.props.type === 'Average') {
                sum = sum / cnt
              }
              return (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
                    {tickFormatter ? tickFormatter(payload.value) : payload.value}
                  </text>
                  <text x={0} y={16} dy={16} textAnchor="middle" fill="#666" fontWeight={"bold"} >
                    {this.props.tab === 'Values' ? "$ " + Intl.NumberFormat('en-US', { notation: 'compact' }).format(sum) : Math.round(sum)}
                  </text>
                </g>
              );
            }} />
            <YAxis tickFormatter={this.props.YFormatter} />
            <Tooltip formatter={this.props.formatterFunction} />
            {(this.props.data?.length && this.props.isLegend) &&
              <Legend iconType={this.props.legendShape || 'circle'} formatter={(value) => value?.split('_')[0]} onClick={this.props.onLegendClick ? this.props.onLegendClick : () => { }} wrapperStyle={{ bottom: -11 }} />
            }
            {this.props.bardataConfig && this.props.bardataConfig.map((item) => {
              return <Line dataKey={item.dataKey} stroke={item.fill} strokeWidth={"2px"} dot={{ strokeWidth: 5, fill: item.fill }} />
            })}
          </LineChart>
        </ResponsiveContainer>
        {this.props.reloadFn &&
          <div className='d-flex justify-content-end align-items-center cursor' onClick={this.props.reloadFn} >
            <img src='assets/images/refresh.png' height={25} width={25} />
            <label className='mb-0 font-size-13 font-wt-500'>Refresh</label>
          </div>
        }
      </div>

  }
}

export default CustomLineChart