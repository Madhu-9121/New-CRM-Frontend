import React, { PureComponent } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';



export default class BarChartComponent extends PureComponent {

  render() {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          width={500}
          height={300}
          data={this.props.data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis dataKey={this.props.xDataKey} />
          <YAxis />
          <Tooltip formatter={this.props.formatterFunction} />
          {this.props.bardataConfig && this.props.bardataConfig.map((item) => {
            return <Bar dataKey={item.dataKey} fill={item.fill} width={5} display={item.display} />
          })}
        </BarChart>
      </ResponsiveContainer>
    );
  }
}
