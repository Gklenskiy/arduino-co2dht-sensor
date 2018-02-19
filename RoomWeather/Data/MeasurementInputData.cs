using System;

namespace RoomWeather.Data
{
	public class MeasurementInputData
	{
		// температура по ощущениям
		public DateTime Time { get; set; }
		
		// температура по ощущениям
		public decimal Ti { get; set; }
		
		// температура в цельсиях
		public decimal T { get; set; }
		
		// влажность
		public decimal H { get; set; }
		
		// уровень CO2
		public decimal PPM { get; set; }

		public static MeasurementInputData FromStringArray(string[] str)
		{
			DateTime Time;
			decimal H = 0;
			decimal T = 0;
			decimal Ti = 0;
			decimal Ppm = 0;

			if (str.Length != 5 || !DateTime.TryParse(str[0], out Time) ||
			    !decimal.TryParse(str[1].Replace('.', ','), out H) ||
			    !decimal.TryParse(str[2].Replace('.', ','), out T) ||
			    !decimal.TryParse(str[3].Replace('.', ','), out Ti) ||
			    !decimal.TryParse(str[4].Replace('.', ','), out Ppm))
			{
				return null;
			}
			
			return new MeasurementInputData
			{
				Time = Time,
				H = H,
				T = T,
				Ti = Ti,
				PPM = Ppm
			};
		}
	}
}