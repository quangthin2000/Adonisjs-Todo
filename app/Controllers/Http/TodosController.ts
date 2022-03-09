import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Todo from 'App/Models/Todo'

export default class TodosController {
    public async index({ view, request }: HttpContextContract) {
        const todos = await Todo.query().preload('user');
        return view.render('dashboard', { todos });
    }
    public async byUserId({ view, auth, request }: HttpContextContract) {

        const user = await auth.authenticate();
        const todos = await Todo.query().where('user_id', user.id).preload('user');
        return view.render('dashboard', { todos });
    }

    public async show({ view, params, auth, request }: HttpContextContract) {
        try {
            const todo = await Todo.find(params.id);
            if (todo) {
                return view.render('show', { todo });
            }
            return; // 401


        } catch (error) {
            console.log(error);
        }
    }

    public async edit({ view, request, params }: HttpContextContract) {
        const todo = await Todo.find(params.id);
        if (todo) {
            return view.render('edit', { todo });
        }
        return; // 401
    }

    public async update({ view, auth, request, params }: HttpContextContract) {

        const user = await auth.authenticate();
        const todo = await Todo.find(params.id);
        if (todo && todo.userId == user.id) {
            todo.title = request.input('title');
            todo.desc = request.input('desc');
            todo.status = request.input('status') == 'on' ? 1 : 0;
            if (await todo.save()) {
                return view.render('show', { todo });
            }
            return;
        }
    }
    public async create({ view, request }: HttpContextContract) {
        return view.render('add');
    }
    public async store({ view, auth, request, response }: HttpContextContract) {
        const user = await auth.authenticate();
        const todo = new Todo();
        todo.title = request.input('title');
        todo.desc = request.input('desc');
        todo.status = request.input('status') == 'on' ? 1 : 0;
        todo.userId = user.id;
        if (await todo.save()) {
            return response.redirect('/dashboard');
        }
        return; // 422
    }
    public async destroy({ response, auth, request, params }: HttpContextContract) {
        const user = await auth.authenticate();
        const todo = await Todo.find(params.id);
        if (todo && todo.userId == user.id) {
            await todo.delete();
            return response.redirect('/dashboard');
        }
    }
}
