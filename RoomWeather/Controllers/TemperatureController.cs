using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using RoomWeather.Data;

namespace RoomWeather.Controllers
{
	[Route("api/[controller]")]
	public class TemperatureController : Controller
	{
		// GET api/temperature
		[HttpGet]
		public IEnumerable<MeasurementInputData> Get()
		{
			var data = GetDataFromFile();
			var delayInMinutes = 30;
			var lastHours = 12;

			var now = DateTime.Now;
			var res = data.Select(MeasurementInputData.FromStringArray)
				.Where(x => x != null && x.Time > now.AddMinutes(-now.Minute).AddHours(-lastHours))
				.GroupBy(x =>
				{
					var stamp = x.Time;
					stamp = stamp.AddMinutes(-(stamp.Minute % delayInMinutes));
					stamp = stamp.AddMilliseconds(-stamp.Millisecond - 1000 * stamp.Second);
					return stamp;
				})
				.Select(g => new MeasurementInputData
				  {
					Time = (new DateTime(g.Key.Year, g.Key.Month, g.Key.Day, g.Key.Hour, g.Key.Minute, 0)),
					T = decimal.Round(g.Average(x => x.T), 1),
					Ti = decimal.Round(g.Average(x => x.Ti), 1),
					H = decimal.Round(g.Average(x => x.H), 1),
					PPM = decimal.Round(g.Average(x => x.PPM), 0),
				  })
				.OrderBy(x => x.Time).ToList();

			return res;
		}
		
		[HttpGet("now")]
		public MeasurementInputData GetCurrent()
		{
			var data = GetDataFromFile();
			var res = data.Select(MeasurementInputData.FromStringArray).Where(x => x != null).OrderByDescending(x => x.Time)
				.First();

			return res;
		}

		private static string[][] GetDataFromFile()
		{
			var startUpFolderPath = Directory.GetCurrentDirectory();
			var filePath = Path.Combine(startUpFolderPath, "data.csv");
			;
			var data = System.IO.File.ReadLines(filePath).Select(x => x.Split(',')).ToArray();
			return data;
		}
	}
}