import { transports, format, createLogger, addColors } from 'winston';

const config = {
    levels: {
        error: 0,
        debug: 1,
        warn: 2,
        data: 3,
        info: 4,
        verbose: 5,
        silly: 6,
        custom: 7,
    },
    colors: {
        error: 'red',
        debug: 'blue',
        warn: 'yellow',
        data: 'grey',
        info: 'green',
        verbose: 'cyan',
        silly: 'magenta',
        custom: 'yellow',
    },
};

addColors(config.colors);

const baseFormat = [
    format.json(),
    format.timestamp(),
    format.align(),
    format.printf((log) => `${new Date(log.timestamp).toLocaleString()} ${log.level}: ${log.message}`),
];

const fileFormat = format.combine(...baseFormat);
const consoleFormat = format.combine(format.colorize(), ...baseFormat);

const logger = createLogger({
    exitOnError: false,
    levels: config.levels,
    transports: [
        new transports.Console({ format: consoleFormat }),

        new transports.File({
            filename: `${__dirname}/../../logs/combined.log`,
            format: fileFormat,
        }),

        new transports.File({
            filename: `${__dirname}/../../logs/error.log`,
            format: fileFormat,
            level: 'error',
        }),
    ],
});

export default logger;
