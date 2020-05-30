const express = require('express');
const app = express();
const expressGraphQL = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt
} = require('graphql');
const _ = require('lodash');

const students = require('../student.json');
const grades = require('../grade.json');
const courses = require('../course.json');

// Student
const StudentType = new GraphQLObjectType({
    name: 'student',
    description: 'Represent students',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        lastname: { type: GraphQLNonNull(GraphQLString) },
        courseId: { type: GraphQLNonNull(GraphQLInt) },
        course : {
            type: CourseType,
            resolve: (student) => {
                return courses.find(course => course.id === student.courseId)
            }
        }
    })
});

// Course
const CourseType = new GraphQLObjectType({
    name: 'course',
    description: 'Represent courses',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        student : {
            type: new GraphQLList(StudentType),
            resolve: (course) => {
                return students.filter(student => student.courseId === course.id)
            }
        }
    })
});

// Grade
const GradeType = new GraphQLObjectType({
    name: 'grade',
    description: 'Represent grades',
    fields: () => ({
        id: { type : GraphQLNonNull(GraphQLInt) },
        grade: { type : GraphQLNonNull(GraphQLString) },
        courseId: { type : GraphQLNonNull(GraphQLInt) },
        studentId: { type : GraphQLNonNull(GraphQLInt) },
        course : {
            type: CourseType,
            resolve: (grade) => {
                return courses.find(course => course.id === grade.courseId)
            }
        },
        student : {
            type: StudentType,
            resolve: (grade) => {
                return students.find(student => student.id === grade.studentId)
            }
        }
    })
});

// ----- Query -----
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        students: {
            type: new GraphQLList(StudentType),
            description: 'List of All Students',
            resolve: () => students
        },
        courses: {
            type: new GraphQLList(CourseType),
            description: 'List of All courses',
            resolve: () => courses
        },
        grades: {
            type: new GraphQLList(GradeType),
            description: 'List of All grades',
            resolve: () => grades
        },
        student: {
            type: StudentType,
            description: 'Particular student',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => students.find(student => student.id === args.id)
        },
        course: {
            type: CourseType,
            description: 'Particular course',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => courses.find(course => course.id === args.id)
        },
        grade: {
            type: GradeType,
            description: 'Particular grade',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => grades.find(grade => grade.id === args.id)
        },
    }),
});

let newStudent = {};
let newCourse = {};
let newGrade = {};

// ----- Mutation -----
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addStudent: {
            type : StudentType,
            description: 'Add a student',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                lastname: { type: GraphQLNonNull(GraphQLString) },
                courseId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                newStudent = {
                    id: students.length + 1 ,
                    name: args.name,
                    lastname: args.lastname,
                    courseId: args.courseId
                },
                students.push(newStudent)
                return newStudent
            }
        },

        addCourse: {
            type : CourseType,
            description: 'Add a course',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                newCourse = {
                    id: courses.length + 1,
                    name: args.name,
                    description: args.description
                },
                courses.push(newCourse)
                return newCourse
            }
        },

        addGrade: {
            type : GradeType,
            description: 'Add a grade',
            args: {
                grade: { type: GraphQLNonNull(GraphQLString) },
                courseId: { type: GraphQLNonNull(GraphQLInt) },
                studentId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                newGrade = {
                    id: grades.length + 1,
                    grade: args.name,
                    courseId: args.courseId,
                    studentId: args.studentId
                },
                grades.push(newGrade)
                return newGrade
            }
        },

        deleteStudent: {
            type: StudentType ,
            description: 'Delete a stundet.',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                let DeleteStudent = _.remove(students, (student) => {
                    return student.id == args.id;
                });
                return DeleteStudent
            }
        },

        deleteCourse: {
            type: CourseType ,
            description: 'Delete a course.',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                let DeleteCourse = _.remove(courses, (course) => {
                    return course.id == args.id;
                });
                return DeleteCourse
            }
        },

        deleteGrade: {
            type: GradeType ,
            description: 'Delete a grade.',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                let DeleteGrade = _.remove(grades, (grade) => {
                    return grade.id == args.id;
                });
                return DeleteGrade
            }
        },
    })
});

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
