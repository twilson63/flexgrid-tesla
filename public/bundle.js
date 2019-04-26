(function () {
	'use strict';

	function noop() {}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	function run_all(fns) {
		fns.forEach(run);
	}

	function is_function(thing) {
		return typeof thing === 'function';
	}

	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function insert(target, node, anchor) {
		target.insertBefore(node, anchor);
	}

	function detach(node) {
		node.parentNode.removeChild(node);
	}

	function element(name) {
		return document.createElement(name);
	}

	function children(element) {
		return Array.from(element.childNodes);
	}

	let current_component;

	function set_current_component(component) {
		current_component = component;
	}

	const dirty_components = [];

	const resolved_promise = Promise.resolve();
	let update_scheduled = false;
	const binding_callbacks = [];
	const render_callbacks = [];
	const flush_callbacks = [];

	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	function flush() {
		const seen_callbacks = new Set();

		do {
			// first, call beforeUpdate functions
			// and update components
			while (dirty_components.length) {
				const component = dirty_components.shift();
				set_current_component(component);
				update(component.$$);
			}

			while (binding_callbacks.length) binding_callbacks.shift()();

			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			while (render_callbacks.length) {
				const callback = render_callbacks.pop();
				if (!seen_callbacks.has(callback)) {
					callback();

					// ...so guard against infinite loops
					seen_callbacks.add(callback);
				}
			}
		} while (dirty_components.length);

		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}

		update_scheduled = false;
	}

	function update($$) {
		if ($$.fragment) {
			$$.update($$.dirty);
			run_all($$.before_render);
			$$.fragment.p($$.dirty, $$.ctx);
			$$.dirty = null;

			$$.after_render.forEach(add_render_callback);
		}
	}

	function mount_component(component, target, anchor) {
		const { fragment, on_mount, on_destroy, after_render } = component.$$;

		fragment.m(target, anchor);

		// onMount happens after the initial afterUpdate. Because
		// afterUpdate callbacks happen in reverse order (inner first)
		// we schedule onMount callbacks before afterUpdate callbacks
		add_render_callback(() => {
			const new_on_destroy = on_mount.map(run).filter(is_function);
			if (on_destroy) {
				on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});

		after_render.forEach(add_render_callback);
	}

	function destroy(component, detaching) {
		if (component.$$) {
			run_all(component.$$.on_destroy);
			component.$$.fragment.d(detaching);

			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			component.$$.on_destroy = component.$$.fragment = null;
			component.$$.ctx = {};
		}
	}

	function make_dirty(component, key) {
		if (!component.$$.dirty) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty = {};
		}
		component.$$.dirty[key] = true;
	}

	function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
		const parent_component = current_component;
		set_current_component(component);

		const props = options.props || {};

		const $$ = component.$$ = {
			fragment: null,
			ctx: null,

			// state
			props: prop_names,
			update: noop,
			not_equal: not_equal$$1,
			bound: blank_object(),

			// lifecycle
			on_mount: [],
			on_destroy: [],
			before_render: [],
			after_render: [],
			context: new Map(parent_component ? parent_component.$$.context : []),

			// everything else
			callbacks: blank_object(),
			dirty: null
		};

		let ready = false;

		$$.ctx = instance
			? instance(component, props, (key, value) => {
				if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
					if ($$.bound[key]) $$.bound[key](value);
					if (ready) make_dirty(component, key);
				}
			})
			: props;

		$$.update();
		ready = true;
		run_all($$.before_render);
		$$.fragment = create_fragment($$.ctx);

		if (options.target) {
			if (options.hydrate) {
				$$.fragment.l(children(options.target));
			} else {
				$$.fragment.c();
			}

			if (options.intro && component.$$.fragment.i) component.$$.fragment.i();
			mount_component(component, options.target, options.anchor);
			flush();
		}

		set_current_component(parent_component);
	}

	class SvelteComponent {
		$destroy() {
			destroy(this, true);
			this.$destroy = noop;
		}

		$on(type, callback) {
			const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
			callbacks.push(callback);

			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		$set() {
			// overridden by instance, if it has props
		}
	}

	/* src/App.html generated by Svelte v3.0.1 */

	function create_fragment(ctx) {
		var section;

		return {
			c() {
				section = element("section");
				section.innerHTML = `<header class="svelte-1ukc52z"><div class="brand svelte-1ukc52z"><img src="images/tesla.svg" class="svelte-1ukc52z"></div>
			    <div class="nav-center svelte-1ukc52z"><p class="nav-item svelte-1ukc52z">MODEL X</p>
			      <p class="nav-item svelte-1ukc52z">MODEL S</p>
			      <p class="nav-item svelte-1ukc52z">MODEL 3</p>
			      <p class="nav-item selected svelte-1ukc52z">ROADSTER</p>
			      <p class="nav-item svelte-1ukc52z">ENERGY</p></div>
			    <div class="nav-right svelte-1ukc52z"><p class="nav-item svelte-1ukc52z">SHOP</p>
			      <p class="nav-item svelte-1ukc52z">SIGN IN</p></div></header>
			  <main class="svelte-1ukc52z"><h2 class="svelte-1ukc52z">Tesla</h2>
			    <h3 class="svelte-1ukc52z">Roadster</h3></main>
			  <footer class="svelte-1ukc52z"><div class="grid svelte-1ukc52z"><div id="a" class="center-column svelte-1ukc52z"><p class="footer-slug svelte-1ukc52z">
			          ​The quickest car in the world, with record-setting<br class="svelte-1ukc52z">
			          acceleration, range and performance.
			        </p></div>
			      <div id="b" class="center-column svelte-1ukc52z"><p class="title has-text-white svelte-1ukc52z"><i class="fas fa-tachometer-alt has-text-grey-light svelte-1ukc52z" style="width: 0.75em; height: 0.75em;"></i>
			          1.9<span class="is-size-5 svelte-1ukc52z">s</span></p>
			        <p class="subtitle has-text-white is-7 svelte-1ukc52z">0-60 mph</p></div>
			      <div id="c" class="center-column svelte-1ukc52z" style="border-left: 1px solid gray;"><p class="title has-text-white svelte-1ukc52z"><span class="is-size-5 svelte-1ukc52z">+</span>250<span class="is-size-5 svelte-1ukc52z">mph</span></p>
			        <p class="subtitle is-7 has-text-white svelte-1ukc52z">Top Speed</p></div>
			      <div id="d" class="center-column svelte-1ukc52z" style="border-left: 1px solid gray;"><p class="title has-text-white svelte-1ukc52z">620<span class="is-size-5 svelte-1ukc52z">mi</span></p>
			        <p class="subtitle is-7 has-text-white svelte-1ukc52z">Mile Range</p></div>
			      <div id="e" class="center-column svelte-1ukc52z"><a class="button is-danger is-inverted is-rounded is-outlined has-text-weight-bold svelte-1ukc52z" style="width: 100%; border: 0.15em solid white;color: white;">
			          Reserve Now
			        </a></div></div></footer>`;
				section.className = "container svelte-1ukc52z";
			},

			m(target, anchor) {
				insert(target, section, anchor);
			},

			p: noop,
			i: noop,
			o: noop,

			d(detaching) {
				if (detaching) {
					detach(section);
				}
			}
		};
	}

	class App extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, null, create_fragment, safe_not_equal, []);
		}
	}

	new App({
	  target: document.body
	});

}());
