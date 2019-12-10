google.charts.load('current', {
  'packages':['geochart', 'table', 'corechart'],
  // Note: you will need to get a mapsApiKey for your project.
  // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
//  'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
});


var app = new Vue({
  el: '#app',
  data: {
    file: '',
    csvString: '',
    name: '',
    message: '',

    uploadedNames: [],
    selectedDataset: '',

    chartTypes: ['map', 'scatter', 'bar', 'area', 'pie'],
    chartType: '',

    data: '',

    drawn: false,
    googleChart: '',
    googleTable: '',

  },
  created() {
    this.getList();
  },
  methods: {
    sayHi() {
      console.log("HELLOOOOOO");
      console.log("Uploaded names:")
      console.log(this.uploadedNames)
    },
    getList() {
      console.log("HELLO");
      try {
        axios.get('http://localhost:3000/csvs')
          .then(function (response) {
            console.log(response);
            app.uploadedNames = response.data;
            app.sayHi();
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      catch (err) {
        console.log(err);
        this.message = err.response.error;
      }
    },
    getData() {
      try {
        axios.get('http://localhost:3000/csvs/' + this.selectedDataset)
          .then(function (response) {
            console.log(response);
            app.data = response.data;
            //app.makeMap();
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      catch (err) {
        console.log(err);
        this.message = err.response.error;
      }
    },
    makeChart() {
      this.drawn = true;
      if (this.chartType == 'map') {
        this.makeMap();
      }
      if (this.chartType == 'scatter') {
        this.makeScatterPlot();
      }
      if (this.chartType == 'bar') {
        this.makeBarChart();
      }
      if (this.chartType == 'area') {
        this.makeAreaChart();
      }
      if (this.chartType == 'pie') {
        this.makePieChart();
      }
      this.makeTable();
    },
    makeTableObj() {
      console.log(JSON.stringify(this.data));

      var table = [];
      var headers = [];
      for (var key in this.data[0]) {
        headers.push(key);
      }
      table.push(headers);

      this.data.forEach(obj => {
        row = []
        headers.forEach(header => {
          float = parseFloat(obj[header]);
          if (isNaN(float)) {
            row.push(obj[header]);
          }
          else {
            row.push(float);
          }
        });
        table.push(row);
      });

      console.log(table);

      return table;
    },
    makeTable() {
      table = this.makeTableObj();

      var data = google.visualization.arrayToDataTable(table);
      this.googleTable = new google.visualization.Table(document.getElementById('table_div'));
      this.googleTable.draw(data, {showRowNumber: true, width: '100%'});
    },
    makePieChart() {
      table = this.makeTableObj();

      var data = google.visualization.arrayToDataTable(table);
      var options = {
        title: this.selectedDataset,
      };
      this.googleChart = new google.visualization.PieChart(document.getElementById('chart_div'));
      this.googleChart.draw(data, options);
    },
    makeAreaChart() {
      table = this.makeTableObj();

      var data = google.visualization.arrayToDataTable(table);
      var options = {
        title: this.selectedDataset,
        hAxis: {title: table[0][0]},
      };
      this.googleChart = new google.visualization.AreaChart(document.getElementById('chart_div'));
      this.googleChart.draw(data, options);
    },
    makeBarChart() {
      table = this.makeTableObj();

      var data = google.visualization.arrayToDataTable(table);
      var options = {
        title: this.selectedDataset,
        hAxis: {title: table[0][0]},
      };
      this.googleChart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
      this.googleChart.draw(data, options);
    },
    makeScatterPlot() {
      table = this.makeTableObj();

      var data = google.visualization.arrayToDataTable(table);
      var options = {
        title: this.selectedDataset,
        hAxis: {title: table[0][0]},
      };
      this.googleChart = new google.visualization.ScatterChart(document.getElementById('chart_div'));
      this.googleChart.draw(data, options);
    },
    makeMap() {
        table = this.makeTableObj();

        var data = google.visualization.arrayToDataTable(table);
        var options = {title: this.selectedDataset};
        this.googleChart = new google.visualization.GeoChart(document.getElementById('chart_div'));
        this.googleChart.draw(data, options);

    },
    saveChartAsPdf() {
      var doc = new jsPDF();
      doc.addImage(this.googleChart.getImageURI(), 0, 0);
      doc.save('chart.pdf');
    },
    saveTableAsPdf() {
      var doc = new jsPDF();
      doc.addImage(this.googleChart.getImageURI(), 0, 0);
      doc.save('chart.pdf');
    },
    onSelect() {
        const allowedTypes = ["text/csv"];
        const file = this.$refs.file.files[0];
        this.file = file;
        // this.name = file.name;

        if (!allowedTypes.includes(file.type)) {
          this.message = "Only csvs are allowed";
        }
        else if (file.size>500000) {
          this.message = "Too large. Max size allowed is 500KB";
        }
        else {
          var fileInput = document.getElementById("csv");
          console.log(fileInput);
          var reader = new FileReader();
          var vm = this;
          reader.onload = function() {
            app.csvString = reader.result;
            // app.data.csvString = reader.result;
          }
          reader.readAsText(fileInput.files[0]);
        }
    },
    async onSubmit() {
      console.log("ONSUBMTI");
      console.log(this.csvString);
      if (this.csvString != 'hi') {
        try {
          await axios.post('http://localhost:3000/upload', { name: this.name, file: this.csvString});
          this.message = 'Uploaded';
        }
        catch (err) {
          console.log(err);
          this.message = err.response.error;
        }
      }

    }
  }
});
